import { createContext, useContext, useState } from "react";
import defaultClasses from "./resources/defaultClasses.json";

interface ClassGradeData {
  finalGradeIndex: number;
  proficiencies: number[];
  className: string;
}

interface AppContextType {
  userGradesList: ClassGradeData[];
  setUserGradesList: React.Dispatch<React.SetStateAction<ClassGradeData[]>>;
  assignedClasses: string[][][]; // adjust type if you know it
  setAssignedClasses: React.Dispatch<React.SetStateAction<any[][][]>>;
  coursePlannerURL: string;
  setCoursePlannerURL: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [userGradesList, setUserGradesList] = useState<ClassGradeData[]>([
    {
      finalGradeIndex: 0,
      proficiencies: [0, 0, 0],
      className: "",
    },
  ]);
  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  const [assignedClasses, setAssignedClasses] = useState<string[][][]>(deepClone(defaultClasses));

  const [coursePlannerURL, setCoursePlannerURL] = useState<string>("");

  return (
    <AppContext.Provider
      value={{
        userGradesList,
        setUserGradesList,
        assignedClasses,
        setAssignedClasses,
        coursePlannerURL,
        setCoursePlannerURL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
