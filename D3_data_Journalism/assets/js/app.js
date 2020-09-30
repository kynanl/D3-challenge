// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity"

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.9,
        d3.max(healthData, d => d[chosenXAxis]) * 1.05
        ])
        .range([0, width]);

    return xLinearScale;
}
//function used for updating y-scale upon click y-axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) 
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, YAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    YAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return YAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))
       


    return circlesGroup;
}
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis])-10)
        .attr("y", d => newYScale(d[chosenYAxis])+6)
       


    return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

    var xlabel;

    if (chosenXAxis === "poverty") {
        xlabel =  "poverty:";
    }
    else if (chosenXAxis === "age") {
        xlabel = "age:";
    }
    else {
        xlabel = "income:"
    }

    var ylabel;
    if (chosenYAxis === "obesity") {
        ylabel = "obesity:";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "smokes:";
    }
    else {
        ylabel = "no health insurance:"
    }




    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br></br>${xlabel}<br></br> ${ylabel}`);
        });


    circlesGroup.call(toolTip);
    

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function (healthData, err) {
    if (err) throw err;
    // parse data
    healthData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare

    })
    console.log(healthData)

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(healthData, d => d.obesity)])
    //     .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var YAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "blue")
        .attr("opacity", ".6");
    var textGroup = chartGroup.selectAll("text.abbr")
        .data(healthData)
        .enter()
        .append("text")
        .classed("abbr", true)
        .attr("x", d => xLinearScale(d[chosenXAxis])-10)
        .attr("y", d => yLinearScale(d[chosenYAxis])+6)
        .text(d => d.abbr)
        


    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width /2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("% of Population in Poverty");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Age");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Income");
    //create group for the y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    // append y axis
    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left) 
        .attr("x", 0 - height/2)
        .attr("dy", "1em")
        .classed("active", true)
        .attr("value", "obesity")
        .text("Obesity Prevalence (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0- height/2)
        .attr("dy", "1em")
        .classed("inactive", true)
        .attr("value", "smokes")
        .text("% of Adults Smoking");

    var healthLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - height/2)
        .attr("dy", "1em")
        .classed("inactive", true)
        .attr("value", "healthcare")
        .text("% of Adults w/ Health Insurance");



    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(healthData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis == "income") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                console.log(chosenYAxis)

               
                // updates y scale for new data
                yLinearScale = yScale(healthData, chosenYAxis);

                // updates y axis with transition
                YAxis = renderYAxes(yLinearScale, YAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
                else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis == "healthcare") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
