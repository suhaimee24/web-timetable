import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

import Curri_section from './page/curri_section';
import Curriculum from './page/curriculum';
import Subject_section from './page/subject_section';
import Timetable from './page/timetable';
//import Testtable from './page/test';

const Routes = () => (
    <Router>
        <Switch>
            <Route exact path="/">
                <Curri_section />
            </Route>
            <Route path="/curriculum">
                <Curriculum />
            </Route>
            <Route path="/subject_section">
                <Subject_section />
            </Route>
            <Route path="/timetable">
                <Timetable />
            </Route>
            <Route path='*'>
                <h1>404 NOT FOUND</h1>
            </Route>
        </Switch>
    </Router>
);

export default Routes;