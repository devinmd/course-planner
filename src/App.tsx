import { useState, useEffect } from "react";
import "./App.css";

// import class information
import classes1 from "./classes.json";
const classes = classes1 as Record<string, any>;
import departments from "./departments.json";

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
    console.log(classIdList);
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
              style={{ backgroundColor: `var(--${item.color}-l)` }}
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
  const headers = ["Freshman", "Sophomore", "Junior", "Senior"];
  const classCount = 8;
  let difficulty: number[] = [0, 0, 0, 0];
  let apCount: number[] = [0, 0, 0, 0];
  for (let [index, y] of assignedClasses.entries()) {
    let difficultyNum: number = 0;
    let count = 8;
    for (let c of y) {
      if (c[0] == "" && c[1] == "") {
        // count--
        continue;
      }
      for (let i of c) {
        if (i == "") continue;
        // if empty, ignore
        // if not empty
        const classData: ClassDataObject = classes[i]; // get class data
        if (classData.ap) apCount[index]++; // count ap
        if (classData.difficulty == null) {
          // if no course difficulty, remove from count
          count -= classData.course_length;
          continue;
        } // if no difficulty rating, ignore
        if (classData.course_length == 0.5)
          difficultyNum += classData.difficulty / 2; // add half difficulty rating if its a half year course
        else difficultyNum += classData.difficulty;
      }
    }
    console.log(difficultyNum + " " + count);
    difficulty[index] = Math.min(difficultyNum / count, 5); // cap at 5
  }

  return (
    <>
      <h3>Your 4-Year Plan</h3>

      <div className="class-display">
        {Array.from({ length: headers.length }).map((_, colIndex) => {
          return (
            <div className="container" key={colIndex}>
              <h4 key={colIndex + "h"}>{headers[colIndex]} Year</h4>
              {Array.from({ length: classCount }).map((_, rowIndex) => {
                // get assigned class
                const assignedClassId: string = assignedClasses[colIndex][rowIndex][0];
                let assignedClassData: ClassDataObject;
                if (assignedClassId != "") {
                  assignedClassData = classes[assignedClassId];
                  assignedClassData.color = departments[assignedClassData.department].color;
                } else {
                  assignedClassData = {} as ClassDataObject;
                }

                // get second class if applicable
                const secondClassId = assignedClasses[colIndex][rowIndex][1];
                const useSecondSlot = assignedClassData.course_length == 0.5 || secondClassId != "";
                let assignedClassData1: ClassDataObject;
                if (secondClassId) {
                  // has second class
                  assignedClassData1 = classes[secondClassId];
                  assignedClassData1.color = departments[assignedClassData1.department].color;
                } else {
                  assignedClassData1 = {} as ClassDataObject;
                }

                const isSelected1 =
                  selectedClassSlot &&
                  selectedClassSlot[0] == rowIndex &&
                  selectedClassSlot[1] == colIndex &&
                  selectedClassSlot[2] == 0;

                const isSelected2 =
                  selectedClassSlot &&
                  selectedClassSlot[0] == rowIndex &&
                  selectedClassSlot[1] == colIndex &&
                  selectedClassSlot[2] == 1;

                const hasClass1: boolean = assignedClassData.color != null;
                const hasClass2: boolean = assignedClassData1.color != null;

                // create & return the button
                return (
                  <div className="class-slot" key={`${rowIndex}-${colIndex}s`}>
                    {true && (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={`${hasClass1 ? "filled" : "white"} ${isSelected1 ? "selected" : ""}`.trim()}
                        onClick={() => onClassSlotClick(rowIndex, colIndex, 0, useSecondSlot)}
                        style={{
                          backgroundColor: hasClass1 ? `var(--${assignedClassData.color}-l)` : "",
                        }}
                      >
                        {(useShorthand
                          ? assignedClassData.shorthand || assignedClassData.name
                          : assignedClassData.name) || "Select Course"}
                      </button>
                    )}
                    {/* second slot */}
                    {useSecondSlot && (
                      <button
                        onClick={() => onClassSlotClick(rowIndex, colIndex, 1, useSecondSlot)}
                        key={`${rowIndex}-${colIndex}-2`}
                        className={`${hasClass2 ? "filled" : "white"} ${isSelected2 ? "selected" : ""}`.trim()}
                        style={{
                          backgroundColor: hasClass2 ? `var(--${assignedClassData1.color}-l)` : "",
                        }}
                      >
                        {secondClassId
                          ? useShorthand
                            ? assignedClassData1.shorthand || assignedClassData1.name
                            : assignedClassData1.name
                          : "Select Class"}
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="selected-courses-info">
                <div>Difficulty: {difficulty[colIndex].toFixed(2)} / 5</div>
                <div>APs: {apCount[colIndex]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer>
      {/* <a>Contact</a>
      <a>Help</a> */}
      <div
        style={{
          marginLeft: "auto",
        }}
      ></div>
      {/* <div>Course list updated 2025/03/26</div> */}
      <div>v0.3.1</div>
    </footer>
  );
}

function Summary({ assignedClasses }: { assignedClasses: [][] }) {
  let currentCredits: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let apsPerYear: number[] = [0, 0, 0, 0];
  let freesPerYear: number[] = [0, 0, 0, 0];
  const maxFreesPerYear: number[] = [1, 1, 2, 2];
  let englishCourses = [0, 0, 0, 0]; // every year has an english class
  let hasUsHistory = false; // us history or apush
  let grade9history = false; // history in grade 9
  let grade10history = false; // history in grade 10

  // iterate through user's selected classes and add the credits to each department
  for (let [yearIndex, years] of assignedClasses.entries()) {
    for (let classIds of years) {
      for (let j = 0; j < 2; j++) {
        const classId = classIds[j];

        if (classId == "") continue;

        const classData: ClassDataObject = classes[classId];

        currentCredits[classData.department] += classData.credit; // count credits
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
            <div className="error-message">You need to take Race & Ethnic Studies, US History, or AP US History.</div>
          )}
          {!(englishCourses[0] > 0 && englishCourses[1] > 0 && englishCourses[2] > 0 && englishCourses[3] > 0) && (
            <div className="error-message">You need to take an English course every year.</div>
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
}: {
  onCheck: (value: boolean) => void;
  onResetClasses: () => void;
  copyURL: () => void;
}) {
  const isMobile = useIsMobile();
  const [showMobileSettings, setShowMobileSettings] = useState<boolean>(false);

  return (
    <>
      <div className="topnav">
        {/* logo */}
        <div className="logo">
          <img src="/icon.svg" />
          <h2>Course Planner</h2>
        </div>
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
                Toggle Abbreviated Course Names
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
            </div>
          </div>
        )}
        {/* desktop buttons */}
        {!isMobile && (
          <>
            <div style={{ marginLeft: "auto" }}></div>
            <div>
              <button className="white" onClick={() => onCheck(true)}>
                Toggle Abbreviated Course Names
              </button>

              <button className="red" onClick={() => onResetClasses()}>
                Reset Classes
              </button>
              <button className="blue" onClick={() => copyURL()}>
                Copy URL for Your Plan
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function App() {
  // state to store users preference on using class shorthands
  const [useShorthand, setUseShorthand] = useState<boolean>(false);

  // create a state to store the selected slot's row and column
  const [selectedSlot, setSelectedSlot] = useState<[number, number, number, boolean] | null>(null);

  const defaultClasses = [
    [
      ["1802", ""],
      ["1000", ""],
      ["1100", ""],
      ["1300", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ],
    [
      ["2802", ""],
      ["2000", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ],
    [
      ["5800", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["0000", ""],
    ],
    [
      ["5801", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["0000", ""],
    ],
  ];

  // Create the array of classes with some placeholder values
  const [assignedClasses, setAssignedClasses] = useState<[any][any][any]>(defaultClasses);

  // runs on first load
  useEffect(() => {
    const url = new URL(window.location.href);
    const classParam = url.searchParams.get("c");

    if (classParam) {
      setAssignedClasses(decodeClasses(classParam));
    } else {
      console.log("No 'c' parameter found in the URL");
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

  function updateQueryParam(key: string, value: string): void {
    const url = new URL(window.location.href);

    if (value === "") {
      url.searchParams.delete(key); // Remove the query parameter if the value is an empty string
    } else {
      url.searchParams.set(key, value); // Add or update the query parameter
    }
    window.history.pushState({}, "", url.toString()); // Update the URL without reloading the page
  }

  function decodeClasses(encoded: string) {
    const decodedSplit = encoded.replace(/e/g, "nn").match(/\d{4}|\d{1,3}|[a-zA-Z]/g) || [];
    console.log("DECODED CLASSES:");
    console.log(decodedSplit);
    let decodedFinal: string[][][] = new Array(4)
      .fill([])
      .map(() => new Array(8).fill(0).map(() => new Array(2).fill("")));
    let currentIndex = [0, 0, 0];
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

    return decodedFinal;
  }

  // TODO
  function encodeClasses() {
    // encode the selected classes and save in the url so the user can copy and share it

    console.log(assignedClasses);

    const encoded: string = JSON.stringify(assignedClasses)
      .replace(/\["",""\]/g, "e")
      .replace(/""/g, "n")
      .replace(/["\[\],]/g, "");

    console.log(encoded);

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

  function resetClasses() {
    setAssignedClasses(defaultClasses);
    updateQueryParam("c", "");
  }

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
      <TopNav onCheck={handleToggleShorthands} onResetClasses={resetClasses} copyURL={copyURL} />

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
        {/* Error messages & notes */}
        <Summary assignedClasses={assignedClasses} />
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
}
