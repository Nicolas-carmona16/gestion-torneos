import LoginForm from "../components/LoginForm";

const Login = ({ setIsAuthenticated }) => {
  return (
    <div className="flex justify-center items-center mb-10">
      <LoginForm setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default Login;
