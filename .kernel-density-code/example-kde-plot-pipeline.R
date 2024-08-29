
# FILE: Kernel_Density.R

# --- SET WORKING DIRECTORY -------------------------------------------------------------------------------------- #

library(rstudioapi)
setwd(sub('/[^/]*$', '', getSourceEditorContext()$path))


# --- IMPORT PACKAGES -------------------------------------------------------------------------------------------- #

library(dplyr) # DPLYR for String Manipulation
library(stringr) # StringR for String Manipulation
library(sf) # Simple Features for Spatial Manipulation
library(spatstat) # Spatial Statistics for Kernel Density Calculation
library(SciViews) # SciViews for Natural Log Function used in Bandwidth Calculation
library(raster) # Raster for Conversion to Raster Format
library(ggplot2) # GGPlot2 for Plotting
library(readr) # For read_tsv()
library(tibble) # For add_column()
library(paleotree) # For reverseList Function
library(gganimate)
library(terra)

# --- KERNEL DENSITY CALCULATION --------------------------------------------------------------------------------- #

set_species <- "savannah"

source("./functions/init_kde.R")

init <- init_KDE(species = set_species, #                                                              INPUT OPTIONS: "savannah" | "forest" | "mixed",
                 method = "VORONOI",    #                                                              INPUT OPTIONS: "VORONOI"
                 pe_type = "median",    #                                                              INPUT_OPTIONS: "median"
                 pe_crs = 4326,         #                                                              INPUT_OPTIONS: Initial coordinate system of the point estimates
                 crs = "ESRI:102022",   #                                                              INPUT_OPTIONS: An equal area projection
                 point_estimate_folder_path = "./datasets/median-point-estimates", #                   INPUT_OPTIONS: Folder path leading to point estimate data
                 study_area_shapefile_path = "./datasets/study-area/Africa_Countries_Projected.shp" #  INPUT_OPTIONS: File path leading to study area shapefile
)

seizure_names <- init$seizure_names

source("./functions/batch_kde.R")

kdens <- batch_KDE(input_ppp_list = init$point_estimates, #                                            INPUT_OPTIONS: A ppp object with an equal-area projection
                                         bbox = st_bbox(init$study_area) * 1.1, #                      INPUT_OPTIONS: Bounding box enclosing all point estimates
                                         eps = 20000)                           #                      INPUT_OPTIONS: The output resolution

source("./functions/cumsum_kde.R")

to_plot <- cumsum_KDE(input_raster_list = kdens$raster, 
                      focal = 3)

# --- KERNEL DENSITY PLOTS --------------------------------------------------------------------------------------- #

scaling_method <- cartography::getBreaks(to_plot[to_plot$layer > 0,]$layer, nclass = 200, method = "fisher")

if (set_species == "savannah") {
  pal <- colorRampPalette(c("black", "#7A0041", "#cc006d", "#e85aa6", "#fcb3da", "#ffedf7")) 
} else if (set_species == "forest") {
  pal <- colorRampPalette(c("black", "#007A04", "#00cc07", "#7be85a", "#bffcb3", "#f0ffed"))
} else {
  pal <- colorRampPalette(c("black", "#001c7a", "#0000cc", "#5a5ae8", "#b3b7fc", "#efedff"))
}

cols <- pal(length(scaling_method))
to_plot$col <- cols[cut(to_plot$layer, scaling_method)]

to_plot[to_plot$layer <= 0,]$col <- "#000000"

p <- ggplot() + 
  geom_tile(data = to_plot, aes(x = x, y = y, fill = col)) +
  geom_sf(data = init$study_area, fill = NA, colour = "grey60") +
  scale_fill_manual(values = cols, na.value = "black") + 
  theme_void() +
  transition_manual(factor(seizure, levels = unique(to_plot$seizure)), cumulative = FALSE) +
  theme(panel.background = element_rect(fill = 'black', colour = 'black'), plot.title = element_text(hjust = 0.5, vjust = 0, size = 12, colour = "grey90"), plot.background = element_rect(fill = 'black', colour = 'black')) +
  guides(fill="none") +
  labs(title = '{current_frame}')

gganimate::animate(p, nframes = length(unique(to_plot$seizure)), device = "png", renderer = file_renderer(paste0("./outputs/", str_to_title(set_species)), prefix = paste0(set_species, "_")), overwrite = TRUE, width = 800, height = 800,res = 300)
