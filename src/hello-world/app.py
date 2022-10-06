import panel as pn

pn.extension(sizing_mode="stretch_width", template="fast")

pn.state.template.param.update(
    site_url="https://awesome-panel.org",
    site="Awesome Panel",
    title="Hello World",
    favicon="https://raw.githubusercontent.com/MarcSkovMadsen/awesome-panel-assets/320297ccb92773da099f6b97d267cc0433b67c23/favicon/ap-1f77b4.ico",
)

pn.panel(
    "Hello and welcome to the awesome world of [Panel](https://panel.holoviz-org) and data apps"
).servable()
