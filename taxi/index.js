/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import test from './src/TaxiApp';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => test);
