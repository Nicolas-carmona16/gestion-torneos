import LoginForm from "../components/LoginForm";

/**
 * @module Login
 * @description Login page component that renders the login form.
 * @param {Object} props
 * @param {Function} props.setIsAuthenticated - Function to update authentication state.
 * @returns {JSX.Element} Login page layout.
 */
const Login = ({ setIsAuthenticated }) => {
  return (
    <div className="flex justify-center items-center mb-10">
      <LoginForm setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default Login;
