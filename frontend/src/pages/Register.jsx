import RegisterForm from "../components/RegisterForm";

const Register = ({ setIsAuthenticated }) => {
  return (
    <div className="flex justify-center items-center mb-10">
      <RegisterForm setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default Register;
