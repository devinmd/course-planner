import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "5%" }}>
      <h1>
        404
        <br />
        Page Not Found
      </h1>
      <p>The page you're looking for doesn't exist.</p>
      <p>Try these links:</p>

      <Link to="/">
        <h2>Course Planner</h2>
      </Link>

      <Link to="/gradecalculator">
        <h2>Grade & GPA Calculator</h2>
      </Link>
    </div>
  );
}

export default NotFound;
