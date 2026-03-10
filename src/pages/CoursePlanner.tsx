import { useState, useEffect, useMemo } from "react";
import "../App.css";
import "./coursePlanner.css";
import { useAppContext } from "../AppContext";
import TopNav from "../components/TopNav";

import defaultClasses from "../resources/defaultClasses.json";
import {
  ClassDataObject,
  Department,
  parseCsvToClasses,
  parseCsvToDepartments,
  decodeClasses,
  encodeClasses,
  getDeptClassIds,
  DEPARTMENTS_API_URL,
  CLASSES_API_URL
} from "../utils/helpers";

function DepartmentSelector({
  classes,
  departments,
  onSelectClass,
  selectedSlot,
  onCancel,
  onRemove,
  useShorthand,
}: {
  classes: Record<string, ClassDataObject>;
  departments: Department[];
  onSelectClass: (classId: string) => void;
  selectedSlot: [number, number, number, boolean];
  onCancel: () => void;
  onRemove: () => void;
  useShorthand: boolean;
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [searchVal, setSearchVal] = useState<string | null>(null);

  // memoized list of class IDs matching the current filters
  const classIdList = useMemo(() => {
    if (selectedDepartment != null && !searchVal) {
      return getDeptClassIds(classes, selectedDepartment);
    }
    if (searchVal) {
      const val = searchVal.toLowerCase();
      return Object.keys(classes).filter((id) => {
        const c: any = classes[id as keyof typeof classes];
        const matches =
          c.name.toLowerCase().includes(val) ||
          (c.shorthand ? c.shorthand.toLowerCase().includes(val) : false) ||
          val === "all";
        return (
          matches &&
          (selectedDepartment === null || c.department === selectedDepartment)
        );
      });
    }
    return [];
  }, [classes, selectedDepartment, searchVal]);

  const handleSearch = (val: string) => setSearchVal(val || null);

  const getHeaderText = () => {
    if (searchVal === "all") return `Select a Course from all ${classIdList.length} Options`;
    if (selectedDepartment === null && !searchVal) return "Select a Department";
    if (selectedDepartment !== null && !searchVal)
      return `Select a Course from ${departments[selectedDepartment].name}`;
    if (searchVal && selectedDepartment === null)
      return `${classIdList.length} results for "${searchVal}"`;
    if (selectedDepartment !== null && searchVal)
      return `${classIdList.length} results for "${searchVal}" in ${departments[selectedDepartment].name}`;
    return "";
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
                  (selectedSlot[1] != null && !allowedInYear(classData, selectedSlot[1])) ||
                  (selectedSlot[3] && isFullLength(classData))
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

// helpers for new API format
function allowedInYear(classData: ClassDataObject, gradeIndex: number): boolean {
  const year = gradeIndex + 9;
  // try new per-grade flags first
  const key = (`allowed${year}` as keyof ClassDataObject);
  const val = (classData as any)[key];
  if (val !== undefined) {
    return Boolean(val);
  }
  // fallback to legacy array
  return classData.allowed_years?.includes(year) ?? true;
}

function isFullLength(classData: ClassDataObject): boolean {
  if (classData.length !== undefined) return classData.length === 1;
  return classData.course_length === 1;
}

function isHalfLength(classData: ClassDataObject): boolean {
  if (classData.length !== undefined) return classData.length === 0.5;
  return classData.course_length === 0.5;
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
      className={`${hasClass ? "filled" : "white"} ${isSelected ? "selected" : ""} ${isHighlighted ? "highlight" : ""
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
  classes,
  departments,
  onClassSlotClick,
  assignedClasses,
  selectedClassSlot,
  useShorthand,
  userName,
  setUserName
}: {
  classes: Record<string, ClassDataObject>;
  departments: Department[];
  onClassSlotClick: (row: number, col: number, slotIndex: number, isHalf: boolean) => void;
  assignedClasses: string[][][];
  selectedClassSlot: any[] | null;
  useShorthand: boolean;
  userName: string;
  setUserName: (name: string) => void;
}) {
  const [hoveredClassID, setHoveredClassID] = useState("");
  const [classIDsToHighlight, setClassIDsToHighlight] = useState<string[]>([]);
  const headers = ["Freshman", "Sophomore", "Junior", "Senior"];
  const classCount = 8;

  const difficulty: number[] = [0, 0, 0, 0];
  const apCount: number[] = [0, 0, 0, 0];


  // compute summary numbers once
  assignedClasses.forEach((year, index) => {
    let difficultyNum = 0;
    let count = year.length;
    year.forEach((slot) => {
      slot.forEach((courseId) => {

        if (!courseId) return;
        const classData = classes[courseId];
        if (!classData) return
        if (classData.ap) apCount[index]++;
        difficultyNum += parseInt(courseId.charAt(0));
      });
      if (slot[0] === "" && slot[1] === "") count--;
    });
    difficulty[index] = Math.min(difficultyNum / (count || 1), 5);
  });

  useEffect(() => {
    if (!hoveredClassID || !classes[hoveredClassID]) {
      setClassIDsToHighlight([]);
      return;
    }

    const highlightIDs: Set<string> = new Set([hoveredClassID]);
    const { prerequisites, department } = classes[hoveredClassID];

    if (Array.isArray(prerequisites)) {
      prerequisites.flat().forEach((id) => highlightIDs.add(id));
    }

    Object.entries(classes).forEach(([id, cls]) => {
      if (cls.department === department) highlightIDs.add(id);
    });

    setClassIDsToHighlight(Array.from(highlightIDs));
  }, [hoveredClassID, classes]);

  return (
    <>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "-1rem" }} className="name-bar">
        <input placeholder="Enter name here" type="text" className="name-input" value={userName} onChange={(e) => setUserName(e.target.value)} />
        <h3 className="title">'s 4-Year Plan</h3>
      </div>

      <div className="year-columns">
        {Array.from({ length: headers.length }).map((_, colIndex) => {
          return (
            <div className="card year-column" key={colIndex}>

              <h4 key={colIndex + "h"}>{headers[colIndex]} Year</h4>

              <div className="class-slots">

                {Array.from({ length: classCount }).map((_, rowIndex) => {
                  const [firstId, secondId] = assignedClasses[colIndex][rowIndex];

                  const getData = (id: string) => {
                    if (!id) return {} as ClassDataObject;
                    if (!classes[id]) return {} as ClassDataObject
                    const data = { ...classes[id] } as ClassDataObject;
                    // if(!data.department) return {} as ClassDataObject;
                    // console.log(classes[id])
                    // if(classes[id])
                    data.color = departments[data.department].color;
                    // else
                    // data.color = "gray"
                    return data;
                  };
                  const assignedClassData = getData(firstId);
                  const secondClassData = getData(secondId);
                  const useSecondSlot = isHalfLength(assignedClassData) || secondId !== "";

                  const isSelected = [
                    Boolean(selectedClassSlot && selectedClassSlot[0] === rowIndex && selectedClassSlot[1] === colIndex && selectedClassSlot[2] === 0),
                    Boolean(selectedClassSlot && selectedClassSlot[0] === rowIndex && selectedClassSlot[1] === colIndex && selectedClassSlot[2] === 1),
                  ];

                  const highlight = (id: string) => classIDsToHighlight.includes(id);

                  return (
                    <div className="class-slot" key={`${rowIndex}-${colIndex}s`}>
                      <ClassButton
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        slotIndex={0}
                        classId={firstId}
                        classData={assignedClassData}
                        isSelected={isSelected[0]}
                        isHighlighted={highlight(firstId)}
                        useShorthand={useShorthand}
                        error={false}
                        onClick={() => onClassSlotClick(rowIndex, colIndex, 0, useSecondSlot)}
                        onHover={() => setHoveredClassID(firstId)}
                        onUnhover={() => setHoveredClassID("")}
                      />

                      {useSecondSlot && (
                        <ClassButton
                          rowIndex={rowIndex}
                          colIndex={colIndex}
                          slotIndex={1}
                          classId={secondId}
                          classData={secondClassData}
                          isSelected={isSelected[1]}
                          isHighlighted={highlight(secondId)}
                          useShorthand={useShorthand}
                          error={false}
                          onClick={() => onClassSlotClick(rowIndex, colIndex, 1, useSecondSlot)}
                          onHover={() => setHoveredClassID(secondId)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="year-column-info">

                <div>
                  Course workload:
                  <span style={{ float: "right" }}> {Math.min(difficulty[colIndex], 5)}/5</span>
                </div>

                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      width: Math.min(((difficulty[colIndex]) / 5) * 100, 100) + "%",
                      backgroundColor: `hsla(${120 - ((difficulty[colIndex]) / 5) * 120}, 100%, 40%, 60%)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Summary({ classes, departments, assignedClasses }: { classes: Record<string, ClassDataObject>; departments: Department[]; assignedClasses: string[][][] }) {
  let currentCredits: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // count amount of credits per department that have been fulfilled
  let apsPerYear: number[] = [0, 0, 0, 0]; // count aps per year
  let freesPerYear: number[] = [0, 0, 0, 0]; // count frees per year
  const maxFreesPerYear: number[] = [1, 1, 2, 2];
  let englishCourses: number[] = [0, 0, 0, 0]; // every year has an english class
  let grade9history = false; // history in grade 9
  let grade10history = false; // history in grade 1
  let duplicates: string[][] = [[], [], [], []];

  // iterate through user's selected classes and add the credits to each department
  for (let [yearIndex, years] of assignedClasses.entries()) {
    // for each year
    let seen: string[] = [];
    for (let classIds of years) {
      // for each class tuple in that year
      for (let j = 0; j < 2; j++) {
        const classId: string = classIds[j];

        if (classId == "") continue;
        if (!classes[classId]) continue;

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
        // removed unused requirement flags
      }
    }
  }

  // determine any required courses that were never scheduled
  const missingRequired: string[] = [];
  Object.entries(classes).forEach(([id, cls]) => {
    if (cls.required) {
      let found = false;
      assignedClasses.forEach((year) =>
        year.forEach((slot) => {
          if (slot.includes(id)) found = true;
        })
      );
      if (!found) missingRequired.push(id);
    }
  });

  return (
    <>
      {/* credit bars */}
      <div className="card summary">
        <h3>Summary</h3>
        <div className="credit-requirements">
          {departments.map(
            (item, index) =>
              item.required_credits > 0 && (
                <div key={index}>
                  {item.name}
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
          {duplicates.map((year, yearIndex) =>
            year.map((classId) => (
              <div className="error-message">
                You cannot take {classes[classId].name} more than once in year {yearIndex + 9}.
              </div>
            ))
          )}
          {!(englishCourses[0] > 0 && englishCourses[1] > 0 && englishCourses[2] > 0 && englishCourses[3] > 0) && (
            <div className="error-message">You need to take an English course every year.</div>
          )}
          {/* missing required courses */}
          {missingRequired.map((classId) => (
            <div key={"req-" + classId} className="error-message">
              You need to take {classes[classId].name}.
            </div>
          ))}
          {/* {!hasUsHistory && (
            <div className="error-message">
              You need to take Race & Ethnic Studies, US History, or AP US History to fulfill your Study of the United
              States requirement.
            </div>
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
          )} */}
        </div>
      </div>
    </>
  );
}

// is mobile browser or not

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
      <div className="card notes">
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

  // store classes that will be fetched from the backend
  const [classes, setClasses] = useState<Record<string, ClassDataObject>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // departments fetched separately (start empty until API loads)
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState<boolean>(true);
  const [deptLoadError, setDeptLoadError] = useState<string | null>(null);

  // Create the array of classes with some placeholder values
  const { assignedClasses, setAssignedClasses } = useAppContext();

  // encoded url string
  const { coursePlannerURL, setCoursePlannerURL } = useAppContext();

  const { userName, setUserName } = useAppContext();

  // fetch classes list from API once when component mounts
  useEffect(() => {
    if (!CLASSES_API_URL) {
      const msg = "CLASSES_API_URL not set, cannot load classes";
      console.warn(msg);
      setLoadError(msg);
      setLoading(false);
      return;
    }

    async function loadClasses() {
      try {
        const resp = await fetch(CLASSES_API_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        // API returns CSV; convert into object map
        const data = parseCsvToClasses(text);
        setClasses(data);
      } catch (err: any) {
        console.error("failed to load classes:", err);
        setLoadError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);


  // fetch departments on mount
  useEffect(() => {
    if (!DEPARTMENTS_API_URL) {
      const msg = "DEPARTMENTS_API_URL not set, cannot load departments";
      console.warn(msg);
      setDeptLoadError(msg);
      setDeptLoading(false);
      return;
    }

    async function loadDepartments() {
      try {
        const resp = await fetch(DEPARTMENTS_API_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        const data = parseCsvToDepartments(text);
        setDepartments(data);
      } catch (err: any) {
        console.error("failed to load departments:", err);
        setDeptLoadError(err.message || String(err));
      } finally {
        setDeptLoading(false);
      }
    }
    loadDepartments();
  }, []);


  // runs on first load for url params etc
  useEffect(() => {
    const url = new URL(window.location.href);
    const classParam = url.searchParams.get("c");
    const nameParam = url.searchParams.get("n");

    if (nameParam) {
      setUserName(nameParam);
      updateQueryParam("n", nameParam);
    }

    if (classParam) {
      setAssignedClasses(decodeClasses(classParam));
      setCoursePlannerURL(classParam);
    } else if (coursePlannerURL) {
      setAssignedClasses(decodeClasses(coursePlannerURL));
      updateQueryParam("c", coursePlannerURL);
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
      updateQueryParam("c", encodeClasses(assignedClasses));
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
    const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));
    setAssignedClasses(deepClone(defaultClasses));
    updateQueryParam("c", "");
  }

  function changeUserName(name: string) {
    setUserName(name);
    updateQueryParam("n", name);
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

  // show loading / error states before rendering planner
  if (loading || deptLoading) {
    return <div>Loading</div>;
  }
  if (loadError || deptLoadError) {
    const msg = loadError || deptLoadError;
    return <div className="error">Error loading{msg}</div>;
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
          classes={classes}
          departments={departments}
          onClassSlotClick={handleClassSlotClick}
          assignedClasses={assignedClasses}
          selectedClassSlot={selectedSlot}
          useShorthand={useShorthand}
          userName={userName}
          setUserName={changeUserName}
        />
        {selectedSlot && (
          <div className="class-selector-wrapper" onClick={() => cancelClassSelector()}>
            <div className="class-selector card" onClick={(event) => event.stopPropagation()}>
              <DepartmentSelector
                classes={classes}
                departments={departments}
                onSelectClass={handleSelectClass}
                selectedSlot={selectedSlot}
                onCancel={cancelClassSelector}
                onRemove={removeClass}
                useShorthand={useShorthand}
              />
            </div>
          </div>
        )}
        <Summary classes={classes} departments={departments} assignedClasses={assignedClasses} />
        <Notes />
      </div>
    </>
  );
}
