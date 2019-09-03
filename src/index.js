import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'

import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import { indigo } from '@material-ui/core/colors'

const theme = createMuiTheme({
	palette: {
		primary: {
			main: indigo[900]
		},
		secondary: {
			main: '#F5F5F5',
			dark: '#B0BEC5'
		},
		background: {
			default: '#F5F5F5'
		}
	},
	typography: {
		fontFamily: [
			'"Avenir Next"',
			'"Segoe UI"',
			'Roboto',
			'-apple-system',
			'sans-serif',
			'BlinkMacSystemFont',
			'"Helvetica Neue"',
			'Arial',
			].join(',')
		}
})

ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<CssBaseline />
		<App />
	</MuiThemeProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
