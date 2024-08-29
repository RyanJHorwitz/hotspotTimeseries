
# Note: Ported from ESRI ArcGIS Pro Kernel Density Tool using https://pro.arcgis.com/en/pro-app/latest/tool-reference/spatial-analyst/how-kernel-density-works.htm
batch_KDE <- function(input_ppp_list, bbox, eps, kernel = "quartic", diggle = TRUE) {
  
  merged_ppp <- c()
  for (index in 1:length(input_ppp_list)) {
    if (typeof(input_ppp_list[[index]]) == "list") {
      merged_ppp <- superimpose(merged_ppp, input_ppp_list[[index]], W = as.owin(bbox))
    }
  }
  
  bounding_box <- Window(merged_ppp)
  
  # Initialize list of raster outputs from kernel density calculation and counter
  m <- 0
  bandwidth_list <- list()
  
  # Loop through all samples, first calculating bandwidth and then kernel density
  for (features in input_ppp_list) {
    
    # Serves as progress bar
    m <- m + 1 # Increment counter
    
    if (!typeof(features) == "character") {
      if (npoints(features) > 1) {
        
        # Calculate bandwidth
        ### Bandwidth is 0.9 * min(SD, sqrt(1/ln(2)) * Dm) * n^-0.2
        # SD is standard distance
        # Dm is median distance from mean center for all points
        # n is number of points
        # min tells us to pick what's smaller, SD or (sqrt(1/ln(2)) * Dm)
        coordinates <- data.frame(X = features$x, Y = features$y)
        mean_center_X <- mean(coordinates$X)
        mean_center_Y <- mean(coordinates$Y)
        
        ### Calculate median distance from mean center
        median_distance <- median(sqrt((coordinates$X - mean_center_X)^2 + (coordinates$Y - mean_center_Y)^2))
        
        ### Calculate standard distance
        standard_distance <- sqrt(sum(((coordinates$X - mean_center_X)^2)/nrow(coordinates)) + sum(((coordinates$Y - mean_center_Y)^2)/nrow(coordinates)))
        
        ### Calculate bandwidth
        bandwidth <- 0.9 * min(c(standard_distance, sqrt(1/ln(2)) * median_distance)) * (nrow(coordinates)^-0.2)
        
        bandwidth_list[[m]] <- bandwidth
        
      } else {
        bandwidth_list[[m]] <- NA
      }
    } else {
      bandwidth_list[[m]] <- NA
    }
  }
  
  bandwidth <- mean(na.omit(do.call(c, bandwidth_list)))
  
  m <- 0
  raster_list <- list()
  for (features in input_ppp_list) {
    
    # Serves as progress bar
    m <- m + 1 # Increment counter
    print(paste0(m,"/",length(input_ppp_list))) # Print loop number
    
    if (!typeof(features) == "character") {
      if (npoints(features) > 1) {
        
        # Calculate kernel density
        plotted <- density.ppp(x = as.ppp(features), sigma = bandwidth, kernel = kernel, diggle = diggle, W = bounding_box, eps = eps) # Calculation for 5000m resolution with diggle edge correction
        density_raster <- raster(plotted) # Convert output to raster
        crs(density_raster) <- "ESRI:102022" # Assign projected coordinate system to raster
        density_raster[is.na(density_raster)] <- 0 # Remove all NA values in raster and change to 0 (important for sum calculation)
        density_raster[!is.na(density_raster)] <- getValues(density_raster) # SHOULD I NORMALIZE? #####################################################################333

        # Add sample density raster to list with all other sample rasters
        raster_list[[m]] <- density_raster

      } else {
        raster_list[[m]] <- NA
      }
    } else {
      raster_list[[m]] <- NA
    }
  }
  
  output <- list(raster_list)
  names(output) <- c("raster")
  
  
  return(output)

}
