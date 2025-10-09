import { Switch, Route } from "react-router-dom";
import FunctionSettings from "../FunctionSetting/FunctionSettings";
import DeviceTab from "../Config/DeviceTab";
import SetupTab from "../Setup/SetupTab";
import HomeLayout from "../HomeLayout/HomeLayout";
import InputPopover from "../Ultils/Popover/Popover";

const AppRoutes = (props) => {

    return (
        <>

            <Switch>
                <Route path="/login">
                </Route>

                <Route path="/config" exact>
                    <DeviceTab />
                </Route>

                <Route path="/setup" exact>
                    <SetupTab />
                </Route>

                <Route path="/funcSettings" exact>
                    <FunctionSettings />
                </Route>

                <Route path="/" exact>
                    {/* <HomeLayout /> */}
                    <InputPopover />
                </Route>

                <Route path="*">
                    404 Not Found!!
                </Route>
            </Switch>
        </>
    )
}

export default AppRoutes