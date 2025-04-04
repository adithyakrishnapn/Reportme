import React from "react";
import "./About.css"

const About = () => {
  return (
    <div className="container-fluid abt">
      <div className="about-page">
        <section className="about-content">
          <p>
            Welcome to <strong>ReportMe</strong> — your trusted platform designed to help individuals reconnect 
            with their lost belongings. Our goal is simple: to provide an easy and reliable solution for reporting 
            and finding lost items, helping people recover what matters most to them. 
          </p>
          <p>
            With a seamless interface and powerful features, ReportMe connects users through an interactive 
            map where lost and found items are posted in real time. Whether it’s a wallet, a phone, or an important 
            document, we’re here to make sure that no item stays lost forever.
          </p>
        </section>
        <section className="about-features">
          <h2>Why Choose ReportMe?</h2>
          <ul>
            <li>
              <strong>Effortless Reporting:</strong> Easily report lost items with detailed descriptions, images, and location.
            </li>
            <li>
              <strong>Smart Search:</strong> Find your lost belongings using advanced filters and real-time item matching.
            </li>
            <li>
              <strong>Location-Based Alerts:</strong> Receive notifications when items matching your lost belongings are found nearby.
            </li>
            <li>
              <strong>Community Support:</strong> Be part of a caring community that helps people reunite with their lost items.
            </li>
            <li>
              <strong>Secure and Reliable:</strong> Your privacy and data security are our top priorities.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default About;
