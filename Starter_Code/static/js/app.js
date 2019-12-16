/*****************************  Set up ******************************/
// Create the data url
const url = "./samples.json";

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

// Update the Demographics information on screen
function updateDemographics(name)
{
    demographics = selectDemographics(name);
    // console.log("demographics:  ", demographics);

    // Select the element to insert demographics within
    let panelBody = d3.selectAll("#sample-metadata");
    panelBody.attr("value","Hello World");

    // Clear existing metadata
    panelBody.html("");

    // console.log(demographics[0]);

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

        names = data.names;
        metadata = data.metadata;
        samples = data.samples;
        // console.log("names: ", data.names);
        // console.log("metadata: ", data.metadata);
        console.log("samples: ", data.samples);

        // Grab the first id for initial dashboard
        let subject = data.names[0];
        console.log("name in init: ", parseInt(subject));
        console.log("metadata id: ", data.metadata[0].id);
        // let id = parseInt(name);

        populateTestSubjectDropDown(data.names);
        // let selection = data.metadata.filter(name => name.id === id);
        // console.log("selection: ", selection);
        // updateDemographics(selection);
        updateDemographics(subject);

        let reversed = initSubjectData(subject);
        // plotBar(reversed, subject);
        // plotBubble(reversed, subject);
    });

}

// Function to convert selection to integer and find demographics
function selectDemographics(subject)
{
    let id = parseInt(subject);
    let selection = metadata.filter(name => name.id === id);
    // console.log("selection: ", selection);
    return selection;
}



// Function to update the dashboard based on test subject selection
function optionChanged()
{
    let id = d3.selectAll("#selDataset").node().value;
    // console.log("updateDashboard: ", id);
    //let id = parseInt(value);
    //console.log(id);
    updateDemographics(id);

    let reversed = initSubjectData(id);
    // next two lines were working
    // plotBar(reversed, id);
    // plotBubble(reversed, id);
    // prior two lines were working



    // TO DO:  REFACTOR THIS TO USE RESTYLE INSTEAD OF REDRAWING
    // console.log(reversed);
    // Plotly.restyle("bar","x",reversed.map(object => object.sample_value));
    // Plotly.restyle("bar", "y",reversed.map(object => object.otu_id));
    // Plotly.restyle("bar","text",reversed.map(object => object.otu_label));
}

// Function to init the horizontal bar chart
function initSubjectData(subject)
{
    let selection = samples.filter(function(sample)
    {
        // console.log(`subject.id: ${sample.id} == subject: ${subject}`);
        let id = parseInt(sample.id);
        // console.log(subject.id == subject);
        return sample.id == subject;
    });
    console.log("samples:  ", samples);
    console.log("subject:  ", subject);
    console.log("selction:  ", selection);
    console.log("values:  ", selection[0].sample_values);
    console.log("labels:  ", selection[0].otu_ids);

    let pts = [];
    for (var i=0; i<selection[0].sample_values.length; i++)
    {
        pts.push({"otu_id":`OTU ${selection[0].otu_ids[i]}`,
                       "sample_value":selection[0].sample_values[i],
                       "otu_label":selection[0].otu_labels[i],
                       "color":selection[0].otu_ids[i]*100,
                       "id":selection[0].otu_ids[i] });
    }

    console.log(pts);
    let bubble = pts;
    plotBubble(bubble, subject);

    let reversed = [];
    if (pts.length < 2)
    {
        reversed = pts;
    }
    else
    {
        console.log(pts[0].sample_value, pts[1].sample_value);
        let sortedByOTU = pts.sort((a, b) => b.sample_value - a.sample_value);
        let sliced = sortedByOTU.slice(0,10);
        reversed = sliced.reverse();

        console.log("sortedByOTU:  ", sortedByOTU);
        console.log("sliced:  ", sliced);
        console.log("reversed:  ", reversed);
    }
    plotBar(reversed, subject);
    return reversed;
}

function plotBar(reversed, subject)
{
    var data = 
    [{
        x: reversed.map(object => object.sample_value),
        y: reversed.map(object => object.otu_id),
        text: reversed.map(object => object.otu_label),
        mode: "bar",
        type: "bar",
        orientation: "h"
    }];

    var layout = 
    {
        title: `Top Ten OTUs for Subject ${subject}`,
        height: 600,
        width: 800  
    };

    Plotly.newPlot("bar", data, layout); 
}

function plotBubble(reversed, subject)
{
    var trace1 = {
        x: reversed.map(object => object.id),
        y: reversed.map(object => object.sample_value),
        mode: 'markers',
        text:  reversed.map(object => object.otu_label),
        marker: {
          size: reversed.map(object => object.sample_value),
          color: reversed.map(object => object.color)
        }
      };
      
      var data = [trace1];
      
      var layout = {
        title: 'Marker Size',
        showlegend: false,
        height: 600,
        width: 1200
      };
      
      Plotly.newPlot('bubble', data, layout);
}


/*************************** Handlers *************************************/
// Call optionChanged when a change takes place
d3.selectAll("#selDataset").on("change", optionChanged);


/**************************** Init ****************************************/
// Initialize the page
init();