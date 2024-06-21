import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as d3 from "d3";
import * as topojson from "topojson";

import "./App.css";

function App() {
  const [education, setEducation] = useState(null);
  const [county, setCounty] = useState(null);
  const doer = () => {
    console.log(county);
    console.log(education);

    const { counties, nation, states } = county.objects;

    const proj = d3.geoMercator().translate(county.transform.translate);
    const svg = d3.select("svg");
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(100,50)`);
    const x = d3
      .scaleLinear()
      .domain(d3.extent(education, (d) => d.bachelorsOrHigher / 100))
      .range([500, 750]);
    legend.call(
      d3
        .axisBottom(x)
        .tickValues(
          d3.range(
            d3.min(education, (d) => d.bachelorsOrHigher) / 100,
            d3.max(education, (d) => d.bachelorsOrHigher) / 100,
            0.09
          )
        )
        .tickFormat(d3.format(".1%"))
    );
    const range = d3.range(
      d3.min(education, (d) => d.bachelorsOrHigher),
      d3.max(education, (d) => d.bachelorsOrHigher),
      9
    );
    const getColor = (eduval) => {
      if (eduval <= range[1]) {
        return "#dbeafe";
      } else if (eduval <= range[2]) {
        return "#bfdbfe";
      } else if (eduval <= range[3]) {
        return "#93c5fd";
      } else if (eduval <= range[4]) {
        return "#60a5fa";
      } else if (eduval <= range[5]) {
        return "#3b82f6";
      } else if (eduval <= range[6]) {
        return "#2563eb";
      } else if (eduval <= range[7]) {
        return "#1d4ed8";
      } else if (eduval <= range[8]) {
        return "#1e40af";
      }
    };
    legend
      .selectAll("rect")
      .data(range.slice(0, 8))
      .enter()
      .append("rect")
      .attr("transform", (d, i) => `translate(${x(d / 100)},-30)`)
      .attr("width", 250 / 8)
      .attr("height", 30)
      .style("fill", (d) => `${getColor(d)}`);
    svg.style("width", "960px");
    svg.style("height", "600px");
    const p = d3.geoPath();
    svg
      .append("path")
      .attr("d", `${p(topojson.feature(county, states, (a, b) => a !== b))}`)
      .style("stroke", "white");
    const c = svg.append("g").attr("class", "counties");
    console.log(range);
    let curr = null;
    c.selectAll("path")
      .data(topojson.feature(county, counties).features)
      .enter()
      .append("path")
      .attr("d", (e) => p(e))
      .attr("class", "county")
      .attr("data-fips", (d) => `${d.id}`)
      .attr("data-education", (d) => {
        curr = education.find((el) => el.fips === d.id);

        return `${curr.bachelorsOrHigher}`;
      })
      .style("fill", (d) => {
        curr = education.find((el) => el.fips === d.id);

        return `${getColor(curr.bachelorsOrHigher)}`;
      });

    const root = d3.select("div");
    const tooltip = root
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("padding", "5px")
      .style("opacity", "0.7")
      .style("background", "green")
      .style("border-radius", "5px")
      .attr("id", "tooltip");

    const text = tooltip.append("p");

    d3.selectAll(".county")
      .on("mouseenter", (e) => {
        const cty = education.find((c) => c.fips === e.target.__data__.id);
        tooltip
          .style("visibility", "visible")
          .style("top", `${e.layerY - 40}px`)
          .style("left", `${e.layerX + 10}px`)
          .attr("data-education", `${cty.bachelorsOrHigher}`);
        console.log(e);
        text.text(`${cty.area_name}, ${cty.state}: ${cty.bachelorsOrHigher}%`);
      })
      .on("mouseleave", () => {
        tooltip.style("visibility", "hidden");
      });
  };
  useEffect(() => {
    const getter = async () => {
      const edures = await fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
      );
      const countres = await fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
      );
      const edu = await edures.json();
      const count = await countres.json();
      setCounty(count);
      setEducation(edu);
    };
    if (!(county && education)) {
      getter();
    } else {
      doer();
    }
  }, [county, education]);

  return (
    <>
      <div>
        <h2 id="title">United States Educational Attainment</h2>
        <h3 id="description">
          Percentage of adults age 25 and older with a bachelor's degree or
          higher (2010-2014)
        </h3>
        <svg></svg>
      </div>
    </>
  );
}

export default App;
