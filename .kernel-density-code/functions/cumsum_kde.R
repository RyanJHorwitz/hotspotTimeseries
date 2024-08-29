cumsum_KDE <- function (input_raster_list, focal) {
  
  raster_list <- lapply(input_raster_list, function (x) {if (typeof(x) == "S4") {rast(x)}})
  if (list(NULL) %in% raster_list) {
    warning("Empty rasters removed from analysis")
  }
  raster_list <- Filter(Negate(is.null), raster_list)
  
  # Get combined extent of all rasters and assign as individual extent for all rasters in list
  full_extent <- ext(do.call(raster::merge, raster_list))
  for (i in 1:length(raster_list)) {
    ext(raster_list[[i]]) <- full_extent
  }
  
  # Create a raster stack and cumulatively sum
  raster_stack <- c(rast(raster_list))
  raster_sum <- app(raster_stack, cumsum)
  summed_list <- as.list(raster_sum)
  
  # Calculate focal statistics for raster smoothing
  if (focal > 0) {
    summed_list <- lapply(summed_list, function(x) {terra::focal(x, focal)}) # Focal statistics for smoothing
  } else if (focal == TRUE) {
    warning("Please set focal parameter to integer that is greater than or equal to 1.")
  }
  
  # Convert rasters to dataframes
  summed_dfs <- lapply(summed_list, function(x) {as.data.frame(x, xy = T)})
  for (i in 1:length(summed_dfs)) {
    summed_dfs[[i]]$seizure <- as.character(seizure_names)[i]
  }
  to_plot <- do.call(rbind, summed_dfs)
  colnames(to_plot) <- c("x", "y", "layer", "seizure")
  
  # Return the output dataframe for plotting
  output <- to_plot
  return (output)
  
}