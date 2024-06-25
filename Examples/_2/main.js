import { CreateRenderer } from '../../lib/TVue.esm.js'
import { App } from './App.js'

const game = new PIXI.Application({
    width: 500,
    height: 500
})
document.body.append(game.view)

const renderer = CreateRenderer({
    HostCreateElement: (type) => {
        if (type === 'Rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()
            return rect
        }
    },
    HostCreateTextNode: (text) => {

    },
    HostPatchProp: (el, key, value) => {
        el[key] = value
    },
    HostInsert: (el, container) => {
        container.addChild(el)
    }
})

renderer.CreateApp(App).Mount(game.stage)