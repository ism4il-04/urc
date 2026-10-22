import './App.css';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {Login} from "./user/Login";
import {Register} from "./user/Register";
import {Messages} from "./messages/Messages";
import {Profile} from "./user/Profile";
import {useSessionStore} from "./store/sessionStore";

// Redirige vers /login si l'utilisateur n'est pas connecté
function PrivateRoute({children}) {
    const session = useSessionStore((state) => state.session);
    return session ? children : <Navigate to="/login"/>;
}

function App() {

  return (
      <BrowserRouter>
          <Routes>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/messages" element={<PrivateRoute><Messages/></PrivateRoute>}/>
              <Route path="/messages/user/:userId" element={<PrivateRoute><Messages/></PrivateRoute>}/>
              <Route path="/messages/room/:roomId" element={<PrivateRoute><Messages/></PrivateRoute>}/>
              <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
              <Route path="*" element={<Navigate to="/messages"/>}/>
          </Routes>
      </BrowserRouter>
  );
}

export default App;
