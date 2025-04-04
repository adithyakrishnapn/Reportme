import React from "react";
import './home.css';
import { NavLink } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";

function Home() {
    return (
        <div className="container-fluid" style={{ width: "100%"}}>
            <section className="hero">
                <h1>Community Issue Reporting Portal</h1>
                <p>
                    A unified platform for citizens to report, track, and resolve community issues. Together, we can make our
                    neighborhood better through effective communication and transparency.
                </p>

                <div className="cta-buttons">
                    <NavLink to="/report" className="btn btn-primary">
                        Report an Issue
                        <span className="icon">→</span>
                    </NavLink>
                </div>

                <div className="features">
                    <div className="feature">
                        <div className="feature-icon icon-location">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                            </svg>
                        </div>
                        <div className="feature-title">Location Based</div>
                    </div>

                    <div className="feature">
                        <div className="feature-icon icon-voice">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z" />
                            </svg>
                        </div>
                        <div className="feature-title">Voice Enabled</div>
                    </div>

                    <div className="feature">
                        <div className="feature-icon icon-tracking">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z" />
                            </svg>
                        </div>
                        <div className="feature-title">Real-time Tracking</div>
                    </div>
                </div>

            </section>
            <Dashboard />
        </div>
    );
}

export default Home;
