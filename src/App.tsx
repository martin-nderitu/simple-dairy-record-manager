import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Home from "./components/home";
import Nav from "./components/nav";
import Footer from "./components/footer";
import Accounts from "./components/accounts";
import AdminRoutes from "./components/admin";
import FarmerRoutes from "./components/farmers";
import MilkCollectorRoutes from "./components/milk-collectors";
import NotFound from "./components/notFound";
import {UserProvider} from "./components/users/userContext";


export default function App() {
  return (
      <UserProvider>
          <Router>
              <Nav/>

              <Switch>
                  <Route exact path="/" component={Home}/>

                  <Route path="/admin" component={AdminRoutes} />

                  <Route path="/farmers" component={FarmerRoutes} />

                  <Route path="/milk-collectors" component={MilkCollectorRoutes} />

                  <Route path="/accounts" component={Accounts} />

                  <Route path="*" component={NotFound} />
                </Switch>

              <Footer/>
          </Router>
      </UserProvider>
  );
}
