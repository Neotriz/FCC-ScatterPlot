$(document).ready(function(){
  const w = 950;
  const h = 600;
  const margin = {
    top: 50,
    bottom: 80,
    left: 60,
    right: 100
  }

  function title(){
    const mainTitle = document.createElement("h1");
    mainTitle.innerHTML = "DOPING IN PROFESSIONAL BICYCLE RACING"
    mainTitle.className = "title";

    const subTitle = document.createElement("h2");
    subTitle.innerHTML = "35 Fastest times up Alpe d'Huez";
    subTitle.className = "subtitle"

    const intro = document.createElement("h3");
    intro.innerHTML = "Normalized to 13.8km distance";
    intro.className = "intro"

    const canvas = document.getElementById('canvas')
    canvas.appendChild(mainTitle)
    canvas.appendChild(subTitle)
    canvas.appendChild(intro)
  }
  function footer(){
    const sources = [
      'https://en.wikipedia.org/wiki/Alpe_d%27Huez',
      'http://www.fillarifoorumi.fi/forum/showthread.php?38129-Ammattilaispy%F6r%E4ilij%F6iden-nousutietoja-%28aika-km-h-VAM-W-W-kg-etc-%29&p=2041608#post2041608',
      'https://alex-cycle.blogspot.com/2015/07/alpe-dhuez-tdf-fastest-ascent-times.html',
      'http://www.dopeology.org/'
    ]

    const footer = document.getElementById("footer");
    let sourceTitle = document.createElement("p");
    let str = ""
    sources.forEach(function(source){
      str += source + "<br>"
    })
    sourceTitle.innerHTML = str;
    footer.appendChild(sourceTitle)

  }
  function render(data){
    const width = w - (margin.left + margin.right);
    const height = h - (margin.top + margin.bottom);
    const svg = d3.select("#canvas")
                  .append("svg")
                  .attr("id","chart")
                  .attr("width", w)
                  .attr("height", h)

    const chart = svg.append("g")
                .classed("display", true)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    //bestTime is use for offset in x-scale units
    const bestTime = d3.min(data,function(d){
      return d.Seconds
    })

    //formatTime is use for converting the parsed delta time for
    //x-axis units

    const formatTime = d3.timeFormat("%M:%S");
    const formatSeconds = function(seconds) {
      return formatTime(new Date(2014, 0, 1, 0, 0, seconds))
    };

    const x = d3.scaleLinear()
                .domain([d3.max(data,function(d){
                  return d.Seconds - bestTime + 10
                }),0])
                .range([0,width])

    const y = d3.scaleLinear()
                .domain(d3.extent(data,function(d){
                  return d.Place + 1
                }))
                .range([0, height])

    const xAxis = d3.axisBottom(x)
                    .tickFormat(formatSeconds)
                    .ticks(7)
                    .tickSize(10);

    const yAxis = d3.axisLeft(y);

    const xGridlines = d3.axisBottom(x)
                        .tickSize(-height)
                        .tickFormat("");

    const yGridlines = d3.axisLeft(y)
                        .tickSize(-width)
                        .tickFormat("")

    //add tooltip for user's interaction
    const toolTip = d3.select("#canvas")
                .append("div")
                  .classed("tooltip", true)
                  .style("opacity",0)
                  .text("helloWorld")

    function textToolTip(d){
      const allegation = d.Doping === "" ? "No allegations" : d.Doping

      return "<strong>" + d.Name + "</strong>" + ":" + " " + d.Nationality + "<br>" +
            "Year: " + d.Year + " Time: " + d.Time + "<br><br>" + allegation
    }

    //drawAxis purpose is to render the axis and its label once
    function drawAxis(params){
      if(params.initialize){
        //draw x gridLines
        this.append("g")
            .classed("x gridline", true)
            .attr("transform","translate(0,"+ height +")")
            .call(params.axis.gridlines.x)
        //draw x axis units
        this.append("g")
            .call(params.axis.x)
            .classed("x axis",true)
            .attr("transform","translate(0,"+ height +")")
        //draw y axis units
        this.append("g")
            .call(params.axis.y)
            .classed("y axis", true)
            .attr("transform","translate(0,0)")
        //draw x axis label
        this.select(".x.axis")
            .append("text")
            .classed("x axis-label",true)
            .attr("transform","translate("+ width/2 +",60)")
            .text("Minutes Behind Fastest Time")
        //draw y axis label
        this.select(".y.axis")
            .append("text")
            .classed("y axis-label", true)
            .attr("transform", "translate(-40,"+ height/2 +") rotate(-90)")
            .text("Rank")
        //appends legends
        this.append("g")
          .classed("legend", true)

        this.select(".legend")
            .append("circle")
              .style("fill", "66CDFF")
              .attr("r",6)
              .attr("cx", 665)
              .attr("cy", 200)

        this.select(".legend")
            .append("circle")
              .style("fill", "D25668")
              .attr("r",6)
              .attr("cx", 665)
              .attr("cy", 220)

        this.select(".legend")
            .append("text")
              .style("fill","white")
              .style("font-size",14)
              .attr("x", 680)
              .attr("y", 204)
              .text("No doping allegations")

        this.select(".legend")
            .append("text")
              .style("fill","white")
              .style("font-size",14)
              .attr("x", 680)
              .attr("y", 224)
              .text("Riders with doping allegations")

        this.select(".legend")
            .append("text")
              .style("fill","white")
              .style("font-size",14)
              .attr("x", 680)
              .attr("y", 244)
              .text("(Click for more info)")
      }
    }

    function plot(params){
      //render axis and its labels
      drawAxis.call(this,params)
      const self = this;
      //enter() phase
      this.selectAll(".point")
          .data(params.data)
          .enter()
          .append("circle")
          .classed("point", true)

      this.selectAll(".bikers-name")
          .data(params.data)
          .enter()
          .append("text")
          .classed("bikers-name",true)

      //update phase
      this.selectAll(".point")
          .attr("r",6)
          .attr("cx", function(d,i){
            return x(d.Seconds - bestTime)
          })
          .attr("cy", function(d,i){
            return y(d.Place)
          })
          .style("fill",function(d,i){
            return d.Doping === "" ? "66CDFF" : "FF6680"
          })
          .on("mouseover",function(d,i){
            const text = textToolTip(d)
            toolTip.transition().delay(100)
                  .style("opacity",0.9)
            toolTip.html(text)
                  .style("left", (d3.event.pageX + 20) + "px")
                  .style("top", (d3.event.pageY - 28) + "px")
            d3.select(this)
              .style("r",10)
          })
          .on("mouseout",function(d,i){
            toolTip.transition()
                .style("opacity",0)
            d3.select(this)
              .style("r",6)
          })
          .on("click",function(d,i){
            if (d.URL != "") {
              window.open(d.URL);
            }
          })

      this.selectAll(".bikers-name")
        .attr("x",function(d,i){
          return x(d.Seconds - bestTime) + 9
        })
        .attr("y",function(d,i){
          return y(d.Place) + 5
        })
        .text(function(d,i){
          return d.Name
        })

      //exit phase
      this.selectAll(".point")
          .data(params.data)
          .exit()
          .remove()

      this.selectAll(".bikers-name")
          .data(params.data)
          .exit()
          .remove()
    }

    plot.call(chart,{
      data:data,
      axis:{
        x: xAxis,
        y: yAxis,
        gridlines : {
          x: xGridlines,
          y: yGridlines
        }
      },
      initialize: true
    })
  }
  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  $.ajax({
    type: "GET",
    dataType: "json",
    url: url,
    beforeSend: ()=> {

    },
    complete: () => {

    },
    success: (data) =>{
      title()
      render(data)
      footer()
    },
    error: () =>{
      let chart = document.getElementById('canvas');
      chart.style.display = "table"
      let errorMessage = document.createElement("h1");
      errorMessage.innerHTML = "ERROR 404: File Not Found!"
      errorMessage.className = "errorMessage";

      chart.appendChild(errorMessage)
    }
  })
})
