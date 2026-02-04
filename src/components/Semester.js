import React from "react";
import { useParams } from "react-router-dom";

const Semester = () => {
  const { id } = useParams();
  const semesterData = {
    1: { subjects: ["ITC", "FPC", "IWT","BMC"], cgpa: 8.5 },
    2: { subjects: ["IFSD", "FPP", "DBMS","PROBS"], cgpa: 8.8 },
  };

  const data = semesterData[id];

  return (
    <div>
      <h2>Semester {id} Details</h2>
      <p>GPA: {data.cgpa}</p>
      <h3>Subjects:</h3>
      <ul>
        {data.subjects.map((subject, index) => (
          <li key={index}>{subject}</li>
        ))}
      </ul>
    </div>
  );
};

export default Semester;
