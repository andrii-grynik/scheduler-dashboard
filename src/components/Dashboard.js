import React, { Component } from "react";
import Axios from "axios";

import { setInterview } from "helpers/reducers";
import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
 } from "helpers/selectors";

import classnames from "classnames";
import Loading from "./Loading";
import Panel from "./Panel";




const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
  }
];





class Dashboard extends Component {
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
  };

  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));
    Promise.all([
      Axios.get("/api/days"),
      Axios.get("/api/appointments"),
      Axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });

    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };
    if (focused) {
      this.setState({ focused });
    }
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }


  selectPanel(id) {
    this.setState(previousState => ({
      focused: previousState.focused !== null ? null : id
    }));
  }

  

  render() {
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
     });

    if (this.state.loading) {
      return <Loading />;
    }

    const panels = (this.state.focused ? data.filter(panel => this.state.focused === panel.id) : data)
    .map(panel => (
     <Panel
      key={panel.id}
      label={panel.label}
      value={panel.getValue(this.state)}
      onSelect={event => this.selectPanel(panel.id)}
     />
    ));

    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;
