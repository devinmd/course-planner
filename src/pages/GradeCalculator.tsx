import { useState, useEffect } from "react";
import "../App.css";
import "./gradeCalculator.css";
import grades from "../resources/grades.json";
import { useAppContext } from "../AppContext";
import { Link } from "react-router-dom";

// Utility hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

function TopNav() {
  const isMobile = useIsMobile();
  return (
    <div className="topnav">
      <div className="logo">
        <img src="/icon.png" />
        <h2>Grade & GPA Calculator</h2>
      </div>
      {!isMobile && (
        <Link to="/">
          <h2>Course Planner</h2>
        </Link>
      )}
    </div>
  );
}

function ClassGrade({
  classIndex,
  finalGradeIndex,
  className,
  strandValues,
  deleteClass,
  totalClasses,
  updateProficiencies,
  updateLetterGradeIndex,
}: {
  classIndex: number;
  strandValues: number[];
  className: string;
  updateProficiencies: (classIndex: number, strandIndex: number, newProficiency: number) => void;
  updateLetterGradeIndex: (classIndex: number, newLetterGradeIndex: number) => void;
  finalGradeIndex: number;
  deleteClass: (index: number) => void;
  totalClasses: number;
}) {
  const isMobile = useIsMobile();

  // number of strands
  const [strandCount, setStrandCount] = useState(strandValues.length);
  // final computed letter grade (index of a letter grade)
  const [letterGradeIndex, setLetterGradeIndex] = useState<number>(finalGradeIndex);

  // handle changing in strand count
  function updateStrandCount(delta: number) {
    let temp = strandCount + delta;
    temp = Math.min(Math.max(temp, 1), 5);
    console.log(temp);
    if (delta == 1) {
      // add
      updateProficiencies(classIndex, temp - 1, 0);
    } else if (delta == -1) {
      updateProficiencies(classIndex, -1, 0);
    }
    setStrandCount(temp);
    updateLetterGrade(temp);
  }

  // change a specific strand's proficiency
  function updateStrandValue(strandIndex: number, delta: number) {
    let newProficiency = Math.min(Math.max(strandValues[strandIndex] + delta, 0), 5);
    // update proficiencies
    updateProficiencies(classIndex, strandIndex, newProficiency);
    // re-compute letter grade
    updateLetterGrade(strandCount);
  }

  // compute letter grade based on strands
  const updateLetterGrade = (strandNumber: number) => {
    let score = 0;
    for (let i of strandValues) score += grades.proficiencies[i].points;
    let map = grades.pointConversions[strandNumber - 1];
    for (const [i, value] of map.entries()) {
      if (score === value) {
        setLetterGradeIndex(i);
        updateLetterGradeIndex(classIndex, i);
        return;
      }
      if (score > value) {
        setLetterGradeIndex(i - 1);
        updateLetterGradeIndex(classIndex, i - 1);
        return;
      }
    }
  };

  return (
    <div className="container class-container">
      <input type="text" className="class-name" placeholder="Class Name" name="Class Name" defaultValue={className} />
      <div className="class-grade-container">
        <button className="delete-class-btn" onClick={() => deleteClass(classIndex)} disabled={totalClasses === 1}>
          X
        </button>

        <div className="strand-count">
          <button onClick={() => updateStrandCount(-1)}>-</button>
          <div>{strandCount}</div>
          <button onClick={() => updateStrandCount(1)}>+</button>
        </div>

        <div className="strands-wrapper" style={{ marginRight: "auto" }}>
          {strandValues.map((value, strandIndex) => (
            <div
              key={strandIndex}
              className="strand"
              style={{
                backgroundColor: `var(--proficiency-${grades.proficiencies[value].abbreviation.toLowerCase()})`,
              }}
            >
              <button onClick={() => updateStrandValue(strandIndex, 1)} disabled={value == 5}>
                -
              </button>
              <div>{isMobile ? grades.proficiencies[value].abbreviation : grades.proficiencies[value].name}</div>
              <button onClick={() => updateStrandValue(strandIndex, -1)} disabled={value == 0}>
                +
              </button>
            </div>
          ))}
        </div>
        <div className="final-grade-wrapper" style={{ marginLeft: "auto" }}>
          <div className="final-grade" style={{ backgroundColor: grades.letterColors[letterGradeIndex] }}>
            {grades.letters[letterGradeIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}

function GpaCalculation({ userGrades }: { userGrades: number[] }) {
  const [gpa, setGPA] = useState(4);

  useEffect(() => {
    if (userGrades.length === 0) {
      setGPA(4);
      return;
    }

    let total = 0;
    for (let i of userGrades) {
      total += grades.gpa[i];
    }

    let tempGPA = total / userGrades.length;
    setGPA(tempGPA);
  }, [userGrades]);

  return (
    <div className="container gpa-container">
      <div className="gpa">{(Math.round((gpa + Number.EPSILON) * 100) / 100).toFixed(2).replace(/\.00$/, ".0")}</div>
    </div>
  );
}

function GradeCalculator() {
  const [listVersion, setListVersion] = useState(0);
  const { userGradesList, setUserGradesList } = useAppContext();

  // add a class
  const addClass = () => {
    setUserGradesList((prev) => [
      ...prev,
      {
        finalGradeIndex: 0,
        proficiencies: [0, 0, 0], // default 3 strands
        className: "",
      },
    ]);
    setListVersion((v) => v + 1); // Force re-render of class list by changing key
  };

  // remove a class
  const removeClass = (index: number) => {
    let temp = [...userGradesList];
    temp.splice(index, 1);
    setUserGradesList(temp);
    setListVersion((v) => v + 1); // Force re-render of class list by changing key
  };

  //
  const updateClassProficiencies = (classIndex: number, strandIndex: number, newProficiency: number) => {
    const temp = [...userGradesList];
    if (strandIndex == temp[classIndex].proficiencies.length) {
      // add new strand
      temp[classIndex].proficiencies.push(0);
    }
    if (strandIndex == -1) {
      // remove a strand
      temp[classIndex].proficiencies.pop();
    }
    temp[classIndex].proficiencies[strandIndex] = newProficiency;
    setUserGradesList(temp);
  };

  //
  function updateClassLetterGradeIndex(classIndex: number, newLetterGradeIndex: number) {
    let temp = [...userGradesList];
    temp[classIndex].finalGradeIndex = newLetterGradeIndex;
    setUserGradesList(temp);
  }

  return (
    <>
      <TopNav />
      <div className="content">
        <h3>Your GPA</h3>
        <GpaCalculation userGrades={userGradesList.map((g) => g.finalGradeIndex)} />
        <h3>Your Grades</h3>
        <div className="class-list" key={listVersion}>
          {userGradesList.map((gradeData, i) => (
            <ClassGrade
              key={i}
              classIndex={i}
              className={gradeData.className}
              finalGradeIndex={gradeData.finalGradeIndex}
              strandValues={gradeData.proficiencies}
              updateProficiencies={updateClassProficiencies}
              updateLetterGradeIndex={updateClassLetterGradeIndex}
              deleteClass={removeClass}
              totalClasses={userGradesList.length}
            />
          ))}
        </div>
        <div className="add-class-wrapper">
          <button onClick={addClass} className="add-class-button">
            Add Class
          </button>
        </div>
      </div>
    </>
  );
}

export default GradeCalculator;
