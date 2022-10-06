# Streaming Indicators Dashboard

Panel runs on top of the Tornado server. Tornado is a fast, asynchronous web server built to
support streaming use cases.

In panel it's very easy to support periodic updates. Here it's done via
`pn.state.add_periodic_callback(_create_callback(indicator), period=1000, count=200)`.