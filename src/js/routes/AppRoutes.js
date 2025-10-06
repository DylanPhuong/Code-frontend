import { Switch, Route } from "react-router-dom";
import ListChannels from "../TagName/ListChannels/ListChannels";
import FunctionSettings from "../TagName/FunctionSetting/FunctionSettings";
import DeviceTab from "../Config/DeviceTab";
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

                <Route path="/channels" exact>
                    <ListChannels />
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