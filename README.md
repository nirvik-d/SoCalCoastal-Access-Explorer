# SoCal Coastal Access Explorer

A JavaScript application using ArcGIS Maps SDK for JavaScript and Calcite Web Components, showing coastal access points in Southern California with type-based filtering and real-time search.

## Features

* **Interactive Map:** Displays coastal access points across Southern California using the ArcGIS Maps SDK for JavaScript.
* **Type-Based Filtering:** Filter access points by categories such as "Beach Access," "Natural Resource," etc., using Calcite Select components.
* **Real-time Search:** Instantly search access points by name or type using a dynamic input field.
* **Dynamic Feature Table:** Displays a sortable and filterable table of access points, integrated with the map view using `arcgis-feature-table`.
* **Location Details:** Pop-up windows provide detailed information for each access point on the map.
* **Southern California Focus:** Filters access points specifically to Los Angeles, Orange, San Diego, Santa Barbara, Ventura, and San Luis Obispo counties.

## Screenshots

*1. Main application*

<img width="959" alt="image" src="https://github.com/user-attachments/assets/acac1cf2-b787-49c9-8135-f6fa045f674e" />

*2. Display all the beach access points in Laguna Beach.*

<img width="959" alt="image" src="https://github.com/user-attachments/assets/1e737596-7568-4b00-a4a9-267339b46954" />

## Prerequisites

* Node.js
* Vite

## Project Setup

1.  **Initialize Project**

    ```bash
    # Create a new Vite project
    npm create vite@latest
    ```

    Follow the instructions on screen to initialize the project.

2.  **Install Dependencies**

    ```bash
    npm install
    ```

## Code Structure

### HTML Structure

The HTML file sets up the basic structure for the ArcGIS web application:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="initial-scale=1,maximum-scale=1,user-scalable=no"
    />

    <title>SoCal Coastal Access Explorer</title>

    <link
      rel="stylesheet"
      href="https://js.arcgis.com/4.32/esri/themes/light/main.css"
    />
    <script src="https://js.arcgis.com/4.32/"></script>
    <script
      type="module"
      src="https://js.arcgis.com/calcite-components/3.0.3/calcite.esm.js"
    ></script>
    <script
      type="module"
      src="https://js.arcgis.com/map-components/4.32/arcgis-map-components.esm.js"
    ></script>

    <link rel="stylesheet" href="./src/style.css" />
  </head>

  <body>
    <calcite-shell>
      <calcite-panel class="map-panel">
        <arcgis-map
          basemap="topo-vector"
          center="-118.4912, 34.0194"
          zoom="8.5"
        >
          <arcgis-zoom position="top-left"></arcgis-zoom>
          <arcgis-expand position="top-left">
            <arcgis-legend></arcgis-legend>
          </arcgis-expand>
        </arcgis-map>
        <div id="selection-menu">
          <calcite-select
            id="type-filter"
            label="Filter by Type"
            placeholder="All Types"
          >
            <calcite-option value="All Beach Access Types"
              >All Beach Access Types</calcite-option
            >
            <calcite-option value="Beach Access">Beach Access</calcite-option>
            <calcite-option value="Natural Resource"
              >Natural Resource</calcite-option
            >
            </calcite-select>
        </div>
      </calcite-panel>

      <calcite-panel class="table-panel">
        <calcite-input
          id="accessSearch"
          placeholder="Search access points..."
          clearable
          icon="search"
        ></calcite-input>
        <arcgis-feature-table
          reference-element="arcgis-map"
          show-layer-dropdown
          show-selection-column
          show-refresh-button
        >
        </arcgis-feature-table>
      </calcite-panel>
    </calcite-shell>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

### CSS Styling

The CSS file provides styling for the map view and UI elements:

```css
html,
body {
  display: flex;
  background-color: var(--calcite-ui-foreground-2);
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
}

arcgis-map {
  height: 100%;
}

.map-panel {
  flex: 0.7;
}

.table-panel {
  flex: 0.3;
}

#selection-menu {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 15rem;
}

arcgis-feature-table {
  height: 100%;
}
```

### JavaScript Implementation

1. **Global Variables**

Create global variables for the base expression, current type, and current search.

```javascript
const baseExpression =
  "COUNTY IN ('Los Angeles', 'Orange', 'San Diego', 'Santa Barbara', 'Ventura', 'San Luis Obispo')";
let currentType = "";
let currentSearch = "";
```

2. **Feature Layer Configuration**

Create a feature layer for the coastal access points.

```javascript
// Purpose: Configures the feature layer for coastal access points
// Implementation:
// - Sets up the layer with a blue marker renderer
// - Filters points to Southern California counties
// - Configures popup template with access point details
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
```

3. **Map Ready Handler**

Create a function to handle the map ready state.

```javascript
// Purpose: Handles map ready state and adds the feature layer to the map
// Implementation:
// - Listens for arcgisViewReadyChange events
// - Adds the feature layer to the map when the map is ready
// - Sets up the feature table with the feature layer
// - Configures the feature table's visible elements
const map = document.querySelector("arcgis-map");
if (!map.ready) {
  map.addEventListener("arcgisViewReadyChange", handleMapReady, {
    once: true, // Ensure the event listener is only added once
  });
} else {
  handleMapReady(); // Map is already ready
}
```

4. **Handle Map Ready Implementation**

```javascript
async function handleMapReady() {
  console.log("Map is ready");
  map.map.add(featureLayer);
}
```

5. **Feature Table Filter Implementation**

Inside the handleMapReady function, add the following code:

```javascript
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
}
```

6. **Type Filter Implementation**

Inside the if (featureTable) block, add the following code:

```javascript
// Purpose: Handles type filtering through Calcite Select component
// Implementation:
// - Listens for calciteSelectChange events
// - Updates the definition expression based on selected type
const calciteSelect = document.querySelector("calcite-select");
if (calciteSelect) {
  calciteSelect.addEventListener("calciteSelectChange", (event) => {
    currentType = event.target.value;
    updateDefinitionExpression();
  });
}
```

7. **Search Functionality**

Continue adding the following code to the if(featureTable) block:

```javascript
// Purpose: Implements real-time search across access points
// Implementation:
// - Listens for input events on search input
// - Updates definition expression with search terms
const searchInput = document.getElementById("accessSearch");
if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    currentSearch = event.target.value.trim().toLowerCase();
    updateDefinitionExpression();
  });
}
```

8. **Definition Expression Update**

Add the function definition for the updating the definition expression based on the filters.

```javascript
// Purpose: Updates the layer's definition expression based on filters
// Implementation:
// - Combines base county filter with type and search filters
// - Applies the expression to both map layer and feature table
function updateDefinitionExpression() {
  let expressionParts = [baseExpression];

  if (currentType !== "All Beach Access Types") {
    expressionParts.push(`AccessType = '${currentType}'`);
  }

  if (currentSearch) {
    const safeSearch = currentSearch.replace(/'/g, "''");
    expressionParts.push(
      `(LOWER(Name) LIKE '%${safeSearch}%' OR LOWER(AccessType) LIKE '%${safeSearch}%')`
    );
  }

  const finalExpression = expressionParts.join(" AND ");
  featureLayer.definitionExpression = finalExpression;
  featureTable.layer.definitionExpression = finalExpression;
}
```

## Running the Application

1. **Development Server**

   ```bash
   npm run dev
   ```

   This will start the development server at `http://localhost:5173`

2. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

1. **View Coastal Access Points**
   - Open the application in your web browser
   - The map will automatically load with all coastal access points in Southern California
   - Use the zoom controls or mouse wheel to zoom in/out
   - Click and drag to pan the map

2. **Filter Access Points by Type**
   - Use the dropdown menu to select a specific type of access point
   - Available categories include:
     - Beach Access
     - Natural Resource
     - And more...
   - Selected type will be highlighted on the map
   - The feature table will update to show only matching points

3. **Search for Specific Points**
   - Use the search bar to find specific access points
   - Type in the name or type of access point
   - Results will update in real-time as you type
   - Matching points will be highlighted on the map

4. **View Detailed Information**
   - Click on any access point on the map to open its popup
   - The popup displays detailed information about the access point
   - Information includes:
     - Name
     - Type
     - Location details
     - Additional relevant information

5. **Use the Feature Table**
   - The table below the map shows all access points
   - Columns can be sorted by clicking on the headers
   - Use the table filters to narrow down results
   - Click on any row to highlight the corresponding point on the map