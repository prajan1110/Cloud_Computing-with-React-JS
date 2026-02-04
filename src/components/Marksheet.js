import React, { Component } from "react";

class Marksheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      studentName: "STUDENT",
      marksheet: [
        { semester: 1, cgpa: 8.5 },
        { semester: 2, cgpa: 8.8 },
      ],
    };
  }

  render() {
    return (
      <div>
        <h2>Student's Marksheet</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Semester</th>
              <th>CGPA</th>
            </tr>
          </thead>
          <tbody>
            {this.state.marksheet.map((sem) => (
              <tr key={sem.semester}>
                <td>{sem.semester}</td>
                <td>{sem.cgpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Marksheet;
