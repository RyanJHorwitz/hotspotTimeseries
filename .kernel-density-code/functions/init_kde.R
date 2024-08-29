init_KDE <- function(species, method = "VORONOI", pe_type = "median", point_estimate_folder_path, pe_crs = 4326, crs, study_area_shapefile_path) {
  
  method = toupper(method)
  pe_type = tolower(pe_type)
  
  # Read in study area shapefiles
  study_area <- st_geometry(read_sf(dsn = study_area_shapefile_path)) # Read in data
  
  # Project subdivided shapefiles
  study_area_projected <- st_transform(study_area, crs = crs) # Project Coordinates
  
  # Read-In Data and Convert to spatstat ppp object
  data_files <- list.files(point_estimate_folder_path, full.names = T)
  seizure_names <- unlist(strsplit(data_files, "*_point_estimates.tsv", perl=FALSE))
  
  seizure_dates <- str_extract(basename(seizure_names), "(?<=_).+?(?=_)")
  data_files <- data_files[!is.na(seizure_dates)]
  seizure_names <- seizure_names[!is.na(seizure_dates)]
  seizure_dates <- seizure_dates[!is.na(seizure_dates)]
  seizure_months <- as.numeric(str_extract(seizure_dates, "[^-]+"))
  seizure_years <- as.numeric(substr(seizure_dates, (nchar(seizure_dates) - 2 + 1), nchar(seizure_dates)))
  
  sorting_frame <- data.frame(data_files = data_files, seizure_names = basename(seizure_names), month = seizure_months, year = seizure_years)
  sorting_frame <- sorting_frame[order(sorting_frame$year, sorting_frame$month, sorting_frame$seizure_names),]
  
  data_files <- factor(sorting_frame$data_files, levels = sorting_frame$data_files)
  seizure_names <- factor(sorting_frame$seizure_names, levels = sorting_frame$seizure_names)
  
  point_estimates <- list()
  i <- 0
  for (name in seizure_names) {
    i <- i + 1
    suppressWarnings(point_estimates[[i]] <- read_tsv(as.character(data_files[i]), col_types = cols()))
  }
  
  geolocalized_points <- list()
  for (index in 1:length(point_estimates)) {
    
    dataset <- point_estimates[[index]]
    separate_species <- split(dataset, f = factor(dataset$species, levels = c("savannah", "forest")))
    coords_ppp <- list()
    i <- 0
    for (specs in separate_species) {
      i <- i + 1
      to_split <- specs[,grepl("SCAT", colnames(specs)) | grepl("VORONOI", colnames(specs))]
      to_store <- specs[,!grepl("SCAT", colnames(specs)) & !grepl("VORONOI", colnames(specs))]
      for (column in sort(1:ncol(to_split), decreasing = T)) {
        if (all(is.na(to_split[,column]))) {
          to_split <- to_split[,-column]
        } else {
          col_split <- as.data.frame(do.call('rbind', strsplit(as.character(pull(to_split[column])),', ',fixed=TRUE)))
          colnames(col_split) <- c(paste0(colnames(to_split[column]), "_Y"), paste0(colnames(to_split[column]), "_X"))
          to_store <- add_column(to_store, col_split, .after = 2)
        }
      }
      if (method == "VORONOI") {
        if (any(grepl(paste0("VORONOI_", pe_type), colnames(to_store))) & nrow(to_store) > 0) { # if VORONOI data exists and nsamples > 0
          to_store <- to_store[!is.na(to_store[paste0("VORONOI_", pe_type, "_X")]),]
          to_store <- to_store[!is.na(to_store[paste0("VORONOI_", pe_type, "_Y")]),]
          coords_sf <- st_as_sf(to_store, coords = c(paste0("VORONOI_", pe_type, "_X"), paste0("VORONOI_", pe_type, "_Y")), crs = pe_crs)
        } else {
          coords_sf <- NA
          warning(paste0("No VORONOI coordinates associated with seizure index [", index, "], species [", names(separate_species)[i], "]."))
        }
      } else {
        errorCondition("No or non-existent method specified.")
      }
      
      if (!all(is.na(coords_sf))) {
        coords_transformed <- st_geometry(st_transform(coords_sf, crs = crs))
        coords_ppp[[i]] <- as.ppp(coords_transformed)
      } else {
        coords_ppp[[i]] <- paste0("No [", names(separate_species)[i],"] data")
      }
    }
    
    geolocalized_points[[index]] <- coords_ppp
    
  }
  
  species = tolower(species)
  if (species == "savannah") {
    stored_species <- species
    species <- 1
  } else if (species == "forest") {
    stored_species <- species
    species <- 2
  } else if (species == "mixed") {
    stored_species <- species
    species <- 3
  }
  
  if (species == 3) {
    for (patterns in 1:length(geolocalized_points)) {
      if (typeof(geolocalized_points[[patterns]][[1]]) != "character" && typeof(geolocalized_points[[patterns]][[2]]) != "character") {
        geolocalized_points[[patterns]][[3]] <- superimpose(geolocalized_points[[patterns]][[1]], geolocalized_points[[patterns]][[2]], W = as.owin(st_bbox(subdivided_projected)))
      } else {
        geolocalized_points[[patterns]][[3]] <- "No data for one or both of [savannah] and [forest]"
      }
    }
  }
  
  geolocalized_points <- reverseList(geolocalized_points)[[species]]
  
  return(list(seizure_names = seizure_names, point_estimates = geolocalized_points, study_area = study_area_projected))
  
}