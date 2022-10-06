import panel as pn

pn.extension(sizing_mode="stretch_width", template="fast")

pn.state.template.param.update(site_url="https://awesome-panel.org", site="Awesome Panel", title="Hello World")

pn.panel("Hello and welcome to the awesome world of [Panel](https://panel.holoviz-org) and data apps").servable()