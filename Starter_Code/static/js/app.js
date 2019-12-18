/*****************************  Set up ******************************/
// Create the data url
const url = "./samples.json";

// Global variables to hold static data
var names = [];
var metadata = [];
var samples = [];

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
function populateTestSubjectDropDown(subjects)
{
    // Select the dropdown box
    var dropDown = d3.selectAll("#selDataset");

    // Clear any html
    dropDown.html("");

    // Populate the list
    subjects.forEach(subject => 
    {
        // insert an element
        let cell = dropDown.append("option").attr("value",subject);     
        cell.text(subject);
    });
}

// Update the Demographics information on screen
function updateDemographics(subject)
{
    // Grab the demographics for this subject
    demographics = selectDemographics(subject);

    // Select the element to insert demographics within
    let panelBody = d3.selectAll("#sample-metadata");

    // Clear existing metadata
    panelBody.html("");

    // Populate the demographics
    Object.entries(demographics[0]).forEach(function([key,value])
    {
        panelBody.append("tr");
        panelBody.append("th").text(`${key}:  `);
        panelBody.append("td").text(value);
    });

    // Plot washes per week
    console.log(demographics);
    let washesPerWeek = parseInt(demographics[0].wfreq);
    plotGauge(washesPerWeek);
}

// Initialize the page
function init()
{
    d3.json(url).then(function(data)
    {
        // Initialize the global data sets
        names = data.names;
        metadata = data.metadata;
        samples = data.samples;

        // Grab the first id for the startup dashboard
        let subject = data.names[0];

        // Populate the drop down
        populateTestSubjectDropDown(data.names);

        // Populate the demographics
        updateDemographics(subject);

        // Init data and plot
        initSubjectDataAndPlot(subject);
    });

}

// Function to convert selection to integer and return the demographics
function selectDemographics(subject)
{
    // Grab the id as an integer
    let id = parseInt(subject);

    // Grab the metadata
    let selection = metadata.filter(name => name.id === id);

    // Return the metadata
    return selection;
}


// Function to update the dashboard based on test subject selection
function optionChanged()
{
    // Grab the selected subject
    let id = d3.selectAll("#selDataset").node().value;

    // Update the demographics table and washes per week
    updateDemographics(id);

    // Prepare data and plot charts
    initSubjectDataAndPlot(id);
}

// Function to grab the subject data
function retrieveSubjectData(subject)
{
    // Find the subject data
    let selection = samples.filter(function(sample)
    {
        // convert to integer
        let id = parseInt(sample.id);

        // select matches
        return sample.id == subject;
    });
    return selection;
}

function createListToChart(selection)
{
    // Loop through to build points for charting
    let pts = [];
    for (var i=0; i<selection[0].sample_values.length; i++)
    {
        pts.push({"otu_id":`OTU ${selection[0].otu_ids[i]}`,
                       "sample_value":selection[0].sample_values[i],
                       "otu_label":selection[0].otu_labels[i],
                       "color":`hsl(${selection[0].otu_ids[i]/10},100,40)`,
                       "id":selection[0].otu_ids[i] });
    }
    return pts;
}

function selectTopTenAndReverseSort(pts)
{
    // Reverse values or plotting on a horizontal bar chart and select the top 10
    let reversed = [];
    if (pts.length < 2)
    {
        // Only 1 pt, no need to do anything
        reversed = pts;
    }
    else
    {
        // Sort, pick to 10 and reverse order
        let sortedByOTU = pts.sort((a, b) => b.sample_value - a.sample_value);
        let sliced = sortedByOTU.slice(0,10);
        reversed = sliced.reverse();
    }
    return reversed;
}

// Function to init the horizontal bar chart
function initSubjectDataAndPlot(subject)
{
    let selection = retrieveSubjectData(subject);
    let pts = createListToChart(selection); 

    // Make a copy of the points and plot the bubble chart
    let bubble = pts;
    plotBubble(bubble, subject);

    // Prep pts for horizontal bar chart
    let reversed = selectTopTenAndReverseSort(pts);

    // Plot the bar chart
    plotBar(reversed, subject);
}

// Function to plot the bar chart
function plotBar(reversed, subject)
{
    // Create the data list
    var data = 
    [{
        x: reversed.map(object => object.sample_value),
        y: reversed.map(object => object.otu_id),
        text: reversed.map(object => object.otu_label),
        mode: "bar",
        type: "bar",
        orientation: "h"
    }];

    // Add the layout
    var layout = 
    {
        title: `Top Ten OTUs for Subject ${subject}`,
        height: 600,
        width: 800,
        xaxis: {title: "Sample Size"},
        yaxis: {title: "ID"} 
    };

    // Plot the bar chart
    Plotly.newPlot("bar", data, layout); 
}

// Function to plot the bubble chart
function plotBubble(reversed, subject)
{
    // Create the data list
    var trace1 = 
    {
        x: reversed.map(object => object.id),
        y: reversed.map(object => object.sample_value),
        mode: 'markers',
        text:  reversed.map(object => object.otu_label),
        marker: 
        {
          size: reversed.map(object => object.sample_value),
          color: reversed.map(object => object.color)
        }
      };
      
      var data = [trace1];
      
      // Add the layout
      var layout = 
      {
        title: 'Belly Button Bacteria',
        xaxis: {title: "OTU ID"},
        yaxis: {title: "Sample Size"},
        showlegend: false,
        height: 600,
        width: 1200
      };
      
      // Plot the bubble chart
      Plotly.newPlot('bubble', data, layout);
}

// Function to plot the washes per week
function plotGauge(washesPerWeek)
{
    var data = [
        {
            type: "indicator",
            value: washesPerWeek,
            gauge: 
            { 
                axis: { visible: true, range: [0, 9] },
                steps: 
                [
                    {range: [0, 1], color: "#edebe4"},
                    {range: [1, 2], color: "#cde3c5"},
                    {range: [2, 3], color: "#b2d6a5"},
                    {range: [3, 4], color: "#95c484"},
                    {range: [4, 5], color: "#7ab366"},
                    {range: [5, 6], color: "#5d9648"},
                    {range: [6, 7], color: "#40732e"},
                    {range: [7, 8], color: "#325c23"},
                    {range: [8, 9], color: "#214215"}
                ]
            },
            domain: 
            { 
                row: 0, 
                column: 0 
            }
        }
      ];
      
      var layout = {
        width: 600,
        height: 400,
        template: {
          data: {
            indicator: [
              {
                title: { text: "<b>Belly Button Washing Frequency</b><br><span style='font-size:0.8em;color:black'>Scrubs per Week</span>" },
                mode: "number+gauge"
              }
            ]
          }
        }
      };
      
      Plotly.newPlot('gauge', data, layout);
}

/*************************** Handlers *************************************/
// Call optionChanged when a change takes place
d3.selectAll("#selDataset").on("change", optionChanged);


/**************************** Init ****************************************/
// Initialize the page
init();