importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/0.14.0/dist/wheels/bokeh-2.4.3-py3-none-any.whl', 'https://cdn.holoviz.org/panel/0.14.0/dist/wheels/panel-0.14.0-py3-none-any.whl', 'numpy', 'typing']
  for (const pkg of env_spec) {
    const pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    await self.pyodide.runPythonAsync(`
      import micropip
      await micropip.install('${pkg}');
    `);
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

"""This example shows a streaming dashboard with Panel."""
from typing import List, Tuple

import numpy as np
import panel as pn

ACCENT = "#1f77b4"
OK_COLOR = "#2ca02c"
ERROR_COLOR = "#d62728"
PERIOD = 25


def _increment(value):
    value = np.random.normal(1, 0.1, 1)[0] * 75
    value = max(0, value)
    value = min(100, value)
    return int(value)


def _create_callback(card):
    def update_card():
        card.value = _increment(card.value)

    return update_card


template = pn.template.FastGridTemplate(
    site="Awesome Panel",
    site_url="https://awesome-panel.org",
    title="Streaming Indicators",
    row_height=160,
    accent_base_color=ACCENT,
    header_background=ACCENT,
    prevent_collision=True,
    save_layout=True,
)
rstep = 1
cstep = 2
colors: List[Tuple[float, str]] = [(66, OK_COLOR), (100, ERROR_COLOR)]
for row in range(0, 3, rstep):
    for col in range(0, 12, cstep):
        indicator = pn.indicators.Number(
            name=f"Sensor {row, col}",
            value=65,
            format="{value}%",
            colors=colors,
            css_classes=["pn-stats-card"],
            sizing_mode="stretch_both",
        )
        template.main[row, col : col + cstep] = indicator

        pn.state.add_periodic_callback(_create_callback(indicator), period=100)

rstep = 2
cstep = 2
for row in range(3, 6, rstep):
    for col in range(0, 12, 2):
        title = f"Sensor {row, col}"
        colors = [(0.7, OK_COLOR), (1, ERROR_COLOR)]
        indicator = pn.indicators.Gauge(
            name=title,
            value=65,
            bounds=(0, 100),
            colors=colors,
            sizing_mode="stretch_both",
            margin=-1,
        )
        template.main[row : row + rstep, col : col + cstep] = indicator

        pn.state.add_periodic_callback(_create_callback(indicator), period=100)

template.servable()


await write_doc()
  `
  const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
  self.postMessage({
    type: 'render',
    docs_json: docs_json,
    render_items: render_items,
    root_ids: root_ids
  });
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.runPythonAsync(`
    import json

    state.curdoc.apply_json_patch(json.loads('${msg.patch}'), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads("""${msg.location}""")
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()