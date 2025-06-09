require(["esri/layers/FeatureLayer"], function (FeatureLayer) {
  const baseExpression =
    "COUNTY IN ('Los Angeles', 'Orange', 'San Diego', 'Santa Barbara', 'Ventura', 'San Luis Obispo')";

  const featureLayer = new FeatureLayer({
    url: "https://services9.arcgis.com/wwVnNW92ZHUIr0V0/arcgis/rest/services/AccessPoints/FeatureServer/0",
    popupTemplate: {
      title: "{Name}, {COUNTY}",
      content: "<p>{Location}</p><p>{Type}</p><p>{Access}</p>",
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "#007ac2",
        size: 10,
      },
    },
    definitionExpression: baseExpression,
  });

  const map = document.querySelector("arcgis-map");
  if (!map.ready) {
    map.addEventListener("arcgisViewReadyChange", handleMapReady, {
      once: true, // Ensure the event listener is only added once
    });
  } else {
    handleMapReady(); // Map is already ready
  }

  async function handleMapReady() {
    console.log("Map is ready");
    map.map.add(featureLayer); // Add the feature layer to the map

    // Get the feature table component
    const featureTable = document.querySelector("arcgis-feature-table");
    if (featureTable) {
      // Set the feature layer as the default layer in the table
      featureTable.layer = featureLayer;
      featureTable.visibleElements = {
        menuItems: {
          clearSelection: true,
          refreshData: true,
          toggleColumns: true,
          selectedRecordsShowAllToggle: true,
          selectedRecordsShowSelectedToggle: true,
          zoomToSelection: true,
          searchBar: true,
        },
      };
      featureTable.tableTemplate = {
        columnTemplates: [
          {
            type: "field",
            fieldName: "COUNTY",
            label: "County",
          },
          {
            type: "field",
            fieldName: "AccessType",
            label: "Access Type",
          },
          {
            type: "field",
            fieldName: "Name",
            label: "Name",
          },
          {
            type: "field",
            fieldName: "Location",
            label: "Location",
          },
        ],
      };

      let currentType = "";
      let currentSearch = "";

      const calciteSelect = document.querySelector("calcite-select");
      if (calciteSelect) {
        calciteSelect.addEventListener("calciteSelectChange", (event) => {
          currentType = event.target.value;
          updateDefinitionExpression();
        });
      }

      const searchInput = document.getElementById("accessSearch");
      if (searchInput) {
        searchInput.addEventListener("input", (event) => {
          currentSearch = event.target.value.trim().toLowerCase();
          updateDefinitionExpression();
        });
      }

      function updateDefinitionExpression() {
        let expressionParts = [baseExpression];
      
        if (currentType !== "All Beach Access Types") {
          expressionParts.push(`AccessType = '${currentType}'`);
        }
      
        if (currentSearch) {
          const safeSearch = currentSearch.replace(/'/g, "''");
          expressionParts.push(`(LOWER(Name) LIKE '%${safeSearch}%' OR LOWER(AccessType) LIKE '%${safeSearch}%')`);
        }
      
        const finalExpression = expressionParts.join(" AND ");
        featureLayer.definitionExpression = finalExpression;
        featureTable.layer.definitionExpression = finalExpression;
      }
    }
  }
});
