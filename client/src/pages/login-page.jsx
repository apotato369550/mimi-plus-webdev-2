import { useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import AuthHeader from './components/AuthHeader.jsx';
import Content from './components/Content.jsx';

function App() {
  return (
    <>
      <AuthHeader />
      <Content>
      <AuthForm variant='login'/>
      </Content>
    </>
  )
}

export default App;