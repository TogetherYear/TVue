import { App } from './App.js'
import { CreateApp } from '../../lib/TVue.esm.js'
const container = document.querySelector("#App")
CreateApp(App).Mount(container)