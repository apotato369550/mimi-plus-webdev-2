import AuthForm from "../components/AuthForm.jsx";
import Header from "../components/Header.jsx";
import Content from "../components/Content.jsx";

function App() {
  return (
    <>
      <Header variant="auth" />
      <Content>
        <AuthForm variant="login" />
      </Content>
    </>
  );
}

export default App;
