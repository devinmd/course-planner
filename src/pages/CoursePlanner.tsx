import { useState, useEffect } from "react";
import "../App.css";
import "./coursePlanner.css";
import { useAppContext } from "../AppContext";
import { Link } from "react-router-dom";

// import class information
import classes1 from "../resources/classes.json";
const classes = classes1 as Record<string, any>;
import departments from "../resources/departments.json";
import defaultClasses from "../resources/defaultClasses.json";

interface ClassDataObject {
  color?: string; // from department color
  name: string;
  ap: boolean;
  credit: number;
  allowed_years: number[];
  department: number;
  shorthand?: string;
  course_length: number;
  hide_id?: boolean;
  difficulty?: number;
  prerequisites?: string[];
}

function DepartmentSelector({
  onSelectClass,
  selectedSlot,
  onCancel,
  onRemove,
  useShorthand,
}: {
  onSelectClass: (classId: string) => void;
  selectedSlot: [number, number, number, boolean];
  onCancel: () => void;
  onRemove: () => void;
  useShorthand: boolean;
}) {
  let [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  let [searchVal, setSearchVal] = useState<string | null>(null);

  let classIdList: any = [];

  const handleSearch = (val: string) => {
    if (val == "") {
      setSearchVal(null);
      return;
    }
    setSearchVal(val);
  };

  if (selectedDepartment != null && !searchVal) {
    classIdList = departments[selectedDepartment].classes;
    // departmentName = departments[selectedDepartment].name;
  } else if (searchVal) {
    let val = searchVal.toLowerCase();
    classIdList = [];
    for (let id in classes) {
      const c: any = classes[id.toString() as keyof typeof classes];
      if (
        c.name.toLowerCase().includes(val) ||
        (c.shorthand ? c.shorthand.toLowerCase().includes(val) : false) ||
        val == "all"
      ) {
        // is a match
        if (selectedDepartment === null || c.department == selectedDepartment) {
          classIdList.push(id);
        }
      }
    }
  }

  const getHeaderText = () => {
    if (searchVal == "all") {
      return `Select a Course from all ${classIdList.length} Options`;
    } else if (selectedDepartment === null && !searchVal) {
      return "Select a Department";
    } else if (selectedDepartment !== null && !searchVal) {
      return `Select a Course from ${departments[selectedDepartment].name}`;
    } else if (searchVal && selectedDepartment === null) {
      return `${classIdList.length} results for "${searchVal}"`;
    } else if (selectedDepartment !== null && searchVal) {
      return `${classIdList.length} results for "${searchVal}" in ${departments[selectedDepartment].name}`;
    }
  };

  return (
    <>
      {/* header & search */}
      <div className="header">
        <h3>{getHeaderText()}</h3>
        <input
          type="text"
          placeholder={
            selectedDepartment != null
              ? `Search for a course in ${departments[selectedDepartment].name}`
              : 'Search for a course or "all"'
          }
          onInput={(e) => handleSearch(e.currentTarget.value)}
          className="search-box"
          value={searchVal ? searchVal : ""}
        />
        <div
          style={{
            marginLeft: "auto",
          }}
        ></div>
      </div>

      {/* department selector */}
      {selectedDepartment === null && !searchVal && (
        <div className="department-list">
          <button onClick={onCancel} className="white">
            Cancel
          </button>
          <button onClick={onRemove} className="white">
            Remove Class
          </button>

          {departments.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedDepartment(index)}
              style={{ backgroundColor: `var(--${item.color}-l)`, color: `var(--${item.color}-d)` }}
              className="filled"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      {/* classes */}
      {(selectedDepartment != null || searchVal) && (
        <div className="class-list">
          <button
            onClick={() => {
              setSelectedDepartment(null);
              setSearchVal(null);
            }}
            className="white"
          >
            Back
          </button>
          {classIdList.map((classId: string, index: number) => {
            const classData: ClassDataObject = classes[classId.toString() as keyof typeof classes];
            return (
              <button
                key={index}
                className="filled"
                onClick={() => onSelectClass(classId.toString())}
                disabled={
                  (classData.allowed_years?.length > 0 &&
                    selectedSlot[1] != null &&
                    !(classData.allowed_years as number[]).includes(selectedSlot[1] + 9)) ||
                  (selectedSlot[3] && classData.course_length == 1)
                }
                style={{ backgroundColor: `var(--${departments[classData.department].color}-l)` }}
              >
                {classData.hide_id ? "" : `(${classId})`}{" "}
                {useShorthand ? classData.shorthand ?? classData.name : classData.name} ({classData.credit})
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function ClassButton({
  rowIndex,
  colIndex,
  slotIndex,
  classId,
  classData,
  isSelected,
  isHighlighted,
  useShorthand,
  error,
  onClick,
  onHover,
  onUnhover,
}: {
  rowIndex: number;
  colIndex: number;
  slotIndex: number;
  classId: string;
  classData: ClassDataObject;
  isSelected: boolean;
  isHighlighted: boolean;
  useShorthand: boolean;
  error: boolean;
  onClick: () => void;
  onHover?: () => void;
  onUnhover?: () => void;
}) {
  const hasClass = classData.color != null;

  const [isMarked, setIsMarked] = useState(false);

  function handleDoubleClick() {
    setIsMarked((prev) => !prev);
  }

  return (
    <button
      onDoubleClick={() => handleDoubleClick()}
      key={`${rowIndex}-${colIndex}-${slotIndex}-${classId}`}
      className={`${hasClass ? "filled" : "white"} ${isSelected ? "selected" : ""} ${
        isHighlighted ? "highlight" : ""
      } ${isMarked ? "marked" : ""} ${error ? "error" : ""}`.trim()}
      onClick={onClick}
      onMouseOver={onHover}
      onMouseLeave={onUnhover}
      style={{
        backgroundColor: isHighlighted ? `var(--${classData.color})` : hasClass ? `var(--${classData.color}-l)` : "",
        color: hasClass ? `var(--${classData.color}-d)` : "default",
        border: isMarked ? `2px dashed var(--${classData.color}-d)` : "",
      }}
    >
      {(useShorthand ? classData.shorthand || classData.name : classData.name) || "Select Course"}
    </button>
  );
}

// grid of classes buttons
function ClassesGrid({
  onClassSlotClick,
  assignedClasses,
  selectedClassSlot,
  useShorthand,
}: {
  onClassSlotClick: (row: number, col: number, slotIndex: number, isHalf: boolean) => void;
  assignedClasses: string[][][];
  selectedClassSlot: any[] | null;
  useShorthand: boolean;
}) {
  const [hoveredClassID, setHoveredClassID] = useState("");
  const [classIDsToHighlight, setClassIDsToHighlight] = useState<string[]>([]);
  const headers = ["Freshman", "Sophomore", "Junior", "Senior"];
  const classCount = 8;
  let difficulty: number[] = [0, 0, 0, 0];
  let apCount: number[] = [0, 0, 0, 0];

  for (let [index, year] of assignedClasses.entries()) {
    let difficultyNum: number = 0;
    let count = 8;
    for (let slot of year) {
      if (slot[0] == "" && slot[1] == "") {
        count--; // if empty slot, remove form count
        continue;
      }

      for (let courseId of slot) {
        if (courseId == "") continue; // if empty, ignore
        const classData: ClassDataObject = classes[courseId]; // get class data
        if (classData.ap) apCount[index]++; // count aps
        if (classData.difficulty == null) {
          // if no difficulty has been assigned for this course, remove from count
          count -= classData.course_length;
        } else if (classData.course_length == 0.5) {
          // add half difficulty rating if its a half year course
          difficultyNum += classData.difficulty / 2;
        } else {
          // add difficulty
          difficultyNum += classData.difficulty;
        }
      }
    }
    difficulty[index] = Math.min(difficultyNum / count, 5); // cap at 5
  }

  useEffect(() => {
    if (!hoveredClassID || !classes[hoveredClassID]) {
      setClassIDsToHighlight([]);
      return;
    }

    const highlightIDs: string[] = [];

    // include the hovered class itself
    highlightIDs.push(hoveredClassID);

    // add prerequisites if they exist
    const prerequisites = classes[hoveredClassID].prerequisites;
    if (Array.isArray(prerequisites)) {
      for (const group of prerequisites) {
        for (const id of group) {
          highlightIDs.push(id);
        }
      }
    }

    // add all classes in the same department
    // this could be made faster by only checking selected classes for their department
    // right now it checks for all classes in the same department even if it's not chosen
    const department = classes[hoveredClassID].department;
    for (const classId in classes) {
      if (classes[classId].department === department) {
        highlightIDs.push(classId);
      }
    }
    setClassIDsToHighlight(highlightIDs);
  }, [hoveredClassID, classes]);

  return (
    <>
      <h3 className="title">Your 4-Year Plan</h3>

      <div className="class-display">
        {Array.from({ length: headers.length }).map((_, colIndex) => {
          return (
            <div className="container" key={colIndex}>
              <h4 key={colIndex + "h"}>{headers[colIndex]} Year</h4>
              {Array.from({ length: classCount }).map((_, rowIndex) => {
                // get assigned class data
                const assignedClassId: string = assignedClasses[colIndex][rowIndex][0];
                let assignedClassData: ClassDataObject;
                if (assignedClassId != "") {
                  assignedClassData = classes[assignedClassId];
                  assignedClassData.color = departments[assignedClassData.department].color;
                } else {
                  assignedClassData = {} as ClassDataObject;
                }

                // Get second selected class if it exists
                const secondClassId = assignedClasses[colIndex][rowIndex][1];
                const useSecondSlot = assignedClassData.course_length === 0.5 || secondClassId !== "";
                let assignedClassData1: ClassDataObject;
                if (secondClassId) {
                  // Has second class
                  assignedClassData1 = {
                    ...classes[secondClassId],
                  };
                  assignedClassData1.color = departments[assignedClassData1.department].color;
                } else {
                  assignedClassData1 = {} as ClassDataObject;
                }

                // tuple to store selected state
                let isSelected = [
                  Boolean(
                    selectedClassSlot &&
                      selectedClassSlot[0] === rowIndex &&
                      selectedClassSlot[1] === colIndex &&
                      selectedClassSlot[2] === 0
                  ),
                  Boolean(
                    selectedClassSlot &&
                      selectedClassSlot[0] === rowIndex &&
                      selectedClassSlot[1] === colIndex &&
                      selectedClassSlot[2] === 1
                  ),
                ];

                // create & return the button
                return (
                  <div className="class-slot" key={`${rowIndex}-${colIndex}s`}>
                    <ClassButton
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      slotIndex={0}
                      classId={assignedClassId}
                      classData={assignedClassData}
                      isSelected={isSelected[0]}
                      isHighlighted={classIDsToHighlight.includes(assignedClassId)}
                      useShorthand={useShorthand}
                      error={false}
                      onClick={() => onClassSlotClick(rowIndex, colIndex, 0, useSecondSlot)}
                      onHover={() => {
                        setHoveredClassID(assignedClassId);
                      }}
                      onUnhover={() => setHoveredClassID("")}
                    />

                    {useSecondSlot && (
                      <ClassButton
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        slotIndex={1}
                        classId={secondClassId}
                        classData={assignedClassData1}
                        isSelected={isSelected[1]}
                        isHighlighted={classIDsToHighlight.includes(secondClassId)}
                        useShorthand={useShorthand}
                        error={false}
                        onClick={() => onClassSlotClick(rowIndex, colIndex, 1, useSecondSlot)}
                        onHover={() => {
                          setHoveredClassID(secondClassId);
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <div className="selected-courses-info">
                <div
                  style={
                    {
                      // display: "none",
                    }
                  }
                >
                  Difficulty:
                  <span style={{ float: "right" }}> {Math.min(difficulty[colIndex] + 1, 5).toFixed(2)}/5</span>
                </div>
                <div
                  className="bar-wrapper"
                  style={{
                    margin: 0,
                    marginBottom: "8px",
                    // display: "none",
                  }}
                >
                  <div
                    className="bar"
                    style={{
                      width: Math.min(((difficulty[colIndex] + 1) / 5) * 100, 100) + "%",
                      backgroundColor: `hsla(${120 - ((difficulty[colIndex] - 0.5) / 3) * 120}, 100%, 40%, 60%)`,
                    }}
                  ></div>
                </div>
                <div>APs: {apCount[colIndex]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Summary({ assignedClasses }: { assignedClasses: string[][][] }) {
  let currentCredits: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // count amount of credits per department that have been fulfilled
  let apsPerYear: number[] = [0, 0, 0, 0]; // count aps per year
  let freesPerYear: number[] = [0, 0, 0, 0]; // count frees per year
  const maxFreesPerYear: number[] = [1, 1, 2, 2];
  let englishCourses: number[] = [0, 0, 0, 0]; // every year has an english class
  let hasUsHistory = false; // us history or apush or race studies
  let grade9history = false; // history in grade 9
  let grade10history = false; // history in grade 1
  let hasStudyOfJapan = false;
  let duplicates: string[][] = [[], [], [], []];
  let hasDigitalLiteracy = false;

  // iterate through user's selected classes and add the credits to each department
  for (let [yearIndex, years] of assignedClasses.entries()) {
    // for each year
    let seen: string[] = [];
    for (let classIds of years) {
      // for each class tuple in that year
      for (let j = 0; j < 2; j++) {
        const classId: string = classIds[j];

        if (classId == "") continue;

        if (
          seen.includes(classId) &&
          classId != "0000" &&
          classId != "0001" &&
          !duplicates[yearIndex].includes(classId)
        ) {
          duplicates[yearIndex].push(classId);
        } else {
          seen.push(classId);
        }

        const classData: ClassDataObject = classes[classId];
        currentCredits[classData.department] += classData.credit; // count credits
        if (
          currentCredits[classData.department] > departments[classData.department].required_credits &&
          classData.department != 11
        ) {
          // if over the minimum required credits for that department, add to electives
          currentCredits[12] += classData.credit;
        }
        if (classId == "5050") currentCredits[0]++; // ap seminar counts as english credit
        if (classData.ap) apsPerYear[yearIndex]++; // count aps
        if (classId == "0000" || classId == "0001") freesPerYear[yearIndex]++; // count frees
        if (classData.department == 0) englishCourses[yearIndex]++; // count english courses
        if (classData.department == 1) {
          // count history courses in year 9 and 10
          if (yearIndex == 0) grade9history = true;
          if (yearIndex == 1) grade10history = true;
        }
        if (classId == "4100" || classId == "5101" || classId == "4101") hasUsHistory = true; // count US history credits
        if (classId == "1903" || classId == "5900") hasDigitalLiteracy = true; // gcda or csp
        if (
          classId == "6100" ||
          classId == "3101" ||
          classId == "1502" ||
          classId == "2502" ||
          classId == "3502" ||
          classId == "4502" ||
          classId == "5502" ||
          classId == "6502" ||
          classId == "6503" ||
          classId == "6504" ||
          classId == "6505" ||
          classId == "6506" ||
          classId == "6507" ||
          classId == "6508"
        )
          hasStudyOfJapan = true; // study of japan credit
      }
    }
  }

  return (
    <>
      {/* credit bars */}
      <div className="summary container">
        <h3>Summary</h3>
        <div className="credit-requirements">
          {departments.map(
            (item, index) =>
              item.required_credits > 0 && (
                <div key={index}>
                  {item.name}:{" "}
                  <span style={{ float: "right" }}>
                    {currentCredits[index]}/{item.required_credits}
                  </span>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: Math.min((currentCredits[index] / item.required_credits) * 100, 100) + "%",
                        backgroundColor: `var(--${item.color}-l)`,
                      }}
                    ></div>
                  </div>
                </div>
              )
          )}
          {/* <div>APs: {apsPerYear[0] + apsPerYear[1] + apsPerYear[2] + apsPerYear[3]}</div> */}
        </div>
        <div className="error-messages">
          {/* if doesnt meet minimum department credit requirements */}
          {departments.map(
            (item, index) =>
              item.required_credits > 0 &&
              currentCredits[index] < item.required_credits && (
                <div key={index} className="error-message">
                  You need {item.required_credits - currentCredits[index]} more credits of {item.name}.
                </div>
              )
          )}
          {/* if doesnt have a free for 2 or more aps */}
          {apsPerYear.map(
            (count, index) =>
              count >= 2 &&
              freesPerYear[index] < 1 && (
                <div key={index} className="error-message">
                  A free period is required in grade {index + 9} because you have 2 or more APs.
                </div>
              )
          )}
          {/* if too many frees in a year */}
          {freesPerYear.map(
            (count, index) =>
              count > maxFreesPerYear[index] && (
                <div key={index} className="error-message">
                  You have too many free periods in grade {index + 9}, maximum is {maxFreesPerYear[index]}.
                </div>
              )
          )}
          {!grade9history && <div className="error-message">You need a Social Studies course in grade 9.</div>}
          {!grade10history && <div className="error-message">You need a Social Studies course in grade 10.</div>}
          {!hasUsHistory && (
            <div className="error-message">
              You need to take Race & Ethnic Studies, US History, or AP US History to fulfill your Study of the United
              States requirement.
            </div>
          )}
          {!(englishCourses[0] > 0 && englishCourses[1] > 0 && englishCourses[2] > 0 && englishCourses[3] > 0) && (
            <div className="error-message">You need to take an English course every year.</div>
          )}
          {duplicates.map((year, yearIndex) =>
            year.map((classId) => (
              <div className="error-message">
                You cannot take {classes[classId].name} more than once in year {yearIndex + 9}.
              </div>
            ))
          )}
          {!hasDigitalLiteracy && (
            <div className="error-message">
              You need to take Global Citizenship in the Digital Age (GCDA) or AP Computer Science Principles (APCSP) to
              fulfill your Digital Literacy requirement.
            </div>
          )}
          {!hasStudyOfJapan && (
            <div className="error-message">
              You need to take a Japanese language course, Study of Japan, or Japan Seminar to fulfill your Study of
              Japan requirement.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// is mobile browser or not
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

function TopNav({
  onCheck,
  onResetClasses,
  copyURL,
  useAbbreviations,
}: {
  onCheck: (value: boolean) => void;
  onResetClasses: () => void;
  copyURL: () => void;
  useAbbreviations: boolean;
}) {
  const isMobile = useIsMobile();
  const [showMobileSettings, setShowMobileSettings] = useState<boolean>(false);

  return (
    <>
      <div className="topnav">
        {/* logo */}
        <div className="logo">
          <img src="/icon.png" />
          <h2>Course Planner</h2>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                background: "var(--error)",
                borderRadius: "16px",
                height: "20px",
                lineHeight: "20px",
                padding: "0 8px",
                color: "white",
              }}
            >
              NEW
            </div>

            <Link to="/gradecalculator">
              <h2>Grade & GPA Calculator</h2>
            </Link>
          </div>
        )}

        {/* mobile settings toggle button */}
        {isMobile && (
          <>
            <button
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className="mobile-options-button"
            ></button>
          </>
        )}
        {/* mobile settings modal */}
        {showMobileSettings && (
          <div className="mobile-settings-wrapper" onClick={() => setShowMobileSettings(false)}>
            <div
              className="container mobile-settings
          "
              onClick={(event) => event.stopPropagation()}
            >
              <h3>Options</h3>
              <button
                className="white"
                onClick={() => {
                  setShowMobileSettings(false);
                }}
              >
                Close
              </button>
              <button
                className="white"
                onClick={() => {
                  onCheck(true);
                  setShowMobileSettings(false);
                }}
              >
                {useAbbreviations ? "Show Full Course Names" : "Abbreviate Course Names"}
              </button>

              <button
                className="red"
                onClick={() => {
                  onResetClasses();
                  setShowMobileSettings(false);
                }}
              >
                Reset Classes
              </button>
              <button
                className="blue"
                onClick={() => {
                  copyURL();
                  setShowMobileSettings(false);
                }}
              >
                Copy URL for Your Plan
              </button>
              <button className="blue" onClick={() => window.print()}>
                Print Your Plan
              </button>
            </div>
          </div>
        )}
        {/* desktop buttons */}
        {!isMobile && (
          <>
            <div style={{ marginLeft: "auto" }}></div>
            <div className="topnav-buttons">
              <button className="white abbreviations" onClick={() => onCheck(true)}>
                {useAbbreviations ? "Show Full Course Names" : "Abbreviate Course Names"}
              </button>

              <button className="red reset" onClick={() => onResetClasses()}>
                Reset Classes
              </button>
              <button className="blue copyurl" onClick={() => copyURL()}>
                Copy URL for Your Plan
              </button>
              <button className="blue print" onClick={() => window.print()}>
                Print Your Plan
              </button>
            </div>
            <div className="print-header">
              Printed Plan
              {/* {new URL(window.location.href).hostname + new URL(window.location.href).pathname.replace(/\/$/, "")} */}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Notes() {
  const [value, setValue] = useState("");

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const textarea = e.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    setValue(textarea.value);
  }

  return (
    <>
      <div className="notes container">
        <h3>Notes</h3>
        <textarea
          wrap="soft"
          placeholder="Type notes here"
          value={value}
          rows={3}
          onInput={handleInput}
          style={{ overflow: "hidden", resize: "none" }}
          className="notes-textarea"
        ></textarea>
        <div className="notes-print">{value}</div>
      </div>
    </>
  );
}

export default function CoursePlanner() {
  // state to store users preference on using class shorthands
  const [useShorthand, setUseShorthand] = useState<boolean>(true);

  // create a state to store the selected slot's row and column
  const [selectedSlot, setSelectedSlot] = useState<[number, number, number, boolean] | null>(null);

  // Create the array of classes with some placeholder values
  const { assignedClasses, setAssignedClasses } = useAppContext();

  // encoded url string
  const { coursePlannerURL, setCoursePlannerURL } = useAppContext();

  // runs on first load
  useEffect(() => {
    const url = new URL(window.location.href);
    const classParam = url.searchParams.get("c");

    if (classParam) {
      setAssignedClasses(decodeClasses(classParam));
      setCoursePlannerURL(classParam);
    } else {
      console.log("No 'c' parameter found in the URL");
      if (coursePlannerURL != "") {
        console.log("found saved classes from app context");
        setAssignedClasses(decodeClasses(coursePlannerURL));
        updateQueryParam("c", coursePlannerURL);
      } else {
        console.log("no saved url from appcontext either");
      }
    }
  }, []); // This will run once when the component is first loaded

  // When a class slot is clicked
  function handleClassSlotClick(classSlotIndex: number, yearIndex: number, slot: number, isHalf: boolean) {
    setSelectedSlot([classSlotIndex, yearIndex, slot, isHalf]);
  }

  // When class from the list is selected
  function handleSelectClass(classId: string) {
    if (selectedSlot) {
      const updatedClasses = [...assignedClasses];
      updatedClasses[selectedSlot[1]][selectedSlot[0]][selectedSlot[2]] = classId;
      setAssignedClasses(updatedClasses);
      setSelectedSlot(null); // Hide department selector & deselect the slot
      encodeClasses();
    }
  }

  // update the url query (when any changes to classes are made)
  function updateQueryParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    if (value === "") {
      url.searchParams.delete(key); // Remove the query parameter if the value is an empty string
    } else {
      url.searchParams.set(key, value); // Add or update the query parameter
    }
    window.history.pushState({}, "", url.toString()); // Update the URL without reloading the page
    // update app context
    setCoursePlannerURL(value);
  }

  // decode classes from url
  function decodeClasses(encoded: string) {
    const decodedSplit = encoded.replace(/b/g, "nn").match(/\d{4}|\d{1,3}|[a-zA-Z]/g) || [];
    console.log("DECODED CLASSES:");
    console.log(decodedSplit);
    let decodedFinal: string[][][] = new Array(4)
      .fill([])
      .map(() => new Array(8).fill(0).map(() => new Array(2).fill("")));
    let currentIndex = [0, 0, 0];
    try {
      for (let i of decodedSplit) {
        if (i.length == 4) {
          decodedFinal[currentIndex[2]][currentIndex[1]][currentIndex[0]] = i;
        }
        if (currentIndex[0] >= 1) {
          currentIndex[1]++;
          currentIndex[0] = 0;
        } else {
          currentIndex[0] += 1;
        }
        if (currentIndex[1] >= 8) {
          currentIndex[2]++;
          currentIndex[1] = 0;
        }
      }
    } catch (err) {
      console.warn(err);
      return assignedClasses;
    }
    return decodedFinal;
  }

  // encode the selected classes and save in the url so the user can copy and share it

  function encodeClasses() {
    const encoded: string = JSON.stringify(assignedClasses)
      .replace(/\["",""\]/g, "b")
      .replace(/""/g, "n")
      .replace(/["\[\],]/g, "");
    updateQueryParam("c", encoded);
  }

  // When cancel button is clicked in department selector
  function cancelClassSelector() {
    setSelectedSlot(null);
  }

  // handle user clicking remove class button
  function removeClass() {
    handleSelectClass("");
    setSelectedSlot(null);
  }

  // handle user clicking the toggle to use abbreviations for class names
  function handleToggleShorthands() {
    setUseShorthand(!useShorthand);
  }

  // reset all classes to default
  function resetClasses() {
    console.log(defaultClasses);

    const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

    setAssignedClasses(deepClone(defaultClasses));
    updateQueryParam("c", "");
  }

  // copy the current url to clipboard
  function copyURL() {
    if (navigator.clipboard) {
      const currentUrl = window.location.href;
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          console.log("URL copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy URL: ", err);
        });
    } else {
      console.error("Clipboard API not supported in this environment");
    }
  }

  return (
    <>
      <TopNav
        onCheck={handleToggleShorthands}
        onResetClasses={resetClasses}
        copyURL={copyURL}
        useAbbreviations={useShorthand}
      />
      <div className="content">
        <ClassesGrid
          onClassSlotClick={handleClassSlotClick}
          assignedClasses={assignedClasses}
          selectedClassSlot={selectedSlot}
          useShorthand={useShorthand}
        />
        {selectedSlot && (
          <div className="class-selector-wrapper" onClick={() => cancelClassSelector()}>
            <div className="class-selector container" onClick={(event) => event.stopPropagation()}>
              <DepartmentSelector
                onSelectClass={handleSelectClass}
                selectedSlot={selectedSlot}
                onCancel={cancelClassSelector}
                onRemove={removeClass}
                useShorthand={useShorthand}
              />
            </div>
          </div>
        )}
        <Summary assignedClasses={assignedClasses} />
        <Notes />
      </div>
    </>
  );
}
