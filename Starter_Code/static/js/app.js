/*****************************  Set up ******************************/
// Create the data url
const url = "./samples.json";

/***************************** Functions *****************************/
/**
 * Helper function to select data
 * Returns an array of values
 * @param {array} rows
 * @param {integer} index
 * index 0 - Metadata.id        Samples.id
 * index 1 - Metadata.ethnicity Samples.otu_ids
 * index 2 - Metadata.gender    Samples.sample_values
 * index 3 - Metadata.age       Samples.otu_labels
 * index 4 - Metadata.location
 */
function unpack(rows, index) {
    return rows.map(function(row) {
      return row[index];
    });
  }

// Function to populate ids in the dropdown
function populateTestSubjectDropDown(names)
{
    // Select the dropdown box
    var dropDown = d3.selectAll("#selDataset");

    // Clear any html
    dropDown.html("");

    // Populate the list
    names.forEach(name => 
    {
        // insert an element
        let cell = dropDown.append("option").attr("value",name);     
        cell.text(name);
    });
}

// Update the Demographics
function updateDemographics(demographics)
{
    console.log("demographics:  ", demographics);
    // Select the element to insert demographics within
    let panelBody = d3.selectAll("#sample-metadata");
    panelBody.attr("value","Hello World");

    // Clear existing metadata
    panelBody.html("");

    console.log(demographics[0]);

    // Populate the demographics
    //panelBody.append("table").attr("class","table table-striped");
    Object.entries(demographics[0]).forEach(function([key,value])
    {
        panelBody.append("tr");
        panelBody.append("th").text(`${key}:  `);
        panelBody.append("td").text(value);
    });
}

// Initialize the page
function init()
{
    d3.json(url).then(function(data)
    {
        console.log("Data: ", data);
        // console.log("Id: ", data[0].metadata.map(row => row.id));
        // var id = data[0].metadata.map(row => row.id);

        console.log("names: ", data.names);
        console.log("metadata: ", data.metadata);
        console.log("samples: ", data.samples);

        // Grab the first id for initial dashboard
        let name = data.names[0];
        console.log("name in init: ", parseInt(name));
        console.log("metadata id: ", data.metadata[0].id);
        let id = parseInt(name);

        populateTestSubjectDropDown(data.names);
        let selection = data.metadata.filter(name => name.id === id);
        console.log("selection: ", selection);
        updateDemographics(selection);
    });

}



// Function to update the dashboard based on test subject selection
function optionChanged(event)
{
    console.log("updateDashboard: ", event);
}


/*************************** Handlers *************************************/
// Call updateDashboard() when a change takes place
d3.selectAll("#selDataset").on("change", optionChanged);


/**************************** Init ****************************************/
// Initialize the page
init();