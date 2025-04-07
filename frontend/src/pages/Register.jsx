import RegisterForm from "../components/RegisterForm";

/**
 * @module Register
 * @description Registration page that renders the signup form for new users.
 * @param {Object} props
 * @param {Function} props.setIsAuthenticated - Function to update authentication state.
 * @returns {JSX.Element} Registration page layout.
 */

const Register = ({ setIsAuthenticated }) => {
  return (
    <div className="flex justify-center items-center mb-10">
      <RegisterForm setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default Register;
