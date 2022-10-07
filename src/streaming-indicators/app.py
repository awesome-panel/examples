"""This example shows a streaming dashboard with Panel."""
from typing import List, Tuple

import numpy as np
import panel as pn

ACCENT = "#1f77b4"
OK_COLOR = "#2ca02c"
ERROR_COLOR = "#d62728"
PERIOD = 500


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
    favicon="https://raw.githubusercontent.com/MarcSkovMadsen/awesome-panel-assets/320297ccb92773da099f6b97d267cc0433b67c23/favicon/ap-1f77b4.ico",
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

        pn.state.add_periodic_callback(_create_callback(indicator), period=PERIOD)

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

        pn.state.add_periodic_callback(_create_callback(indicator), period=PERIOD)

template.servable()
