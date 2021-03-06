import React, { Component } from 'react';
import { Card, CardTitle, CardHeader, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TopBar from './TopBar.jsx'
import Auth from '../../modules/Auth.js'
import { Tabs, Tab } from 'material-ui/Tabs'
import 'whatwg-fetch'
import appConstants from '../../modules/appConstants.js'
import { Button, Form, FormGroup, InputGroup, ControlLabel, FormControl, Col } from 'react-bootstrap';
import CircularProgress from 'material-ui/CircularProgress';
//import Dialog from 'react-bootstrap-dialog'

var baseUrl = appConstants.baseUrl;
/**
* Home page with tabs of heritage items
*/
const HomePage = React.createClass({
	getInitialState: function () {
		return {
			filterText: '',
			extrafilter: {
				location: '',
				creator: ''
			},
			value: 'a',
			items: [],
			hideAdvanced: true,
			dialogOpen: false,
			intendedIndex: null,
			isLoading: false
		};
	},

	handleDialogOpen(index) {
		this.setState({ dialogOpen: true, intendedIndex: index });
	},

	handleDialogClose() {
		this.setState({ dialogOpen: false });
	},

	onAdvancedSearchChange(e) {
		const extrafilter = this.state.extrafilter;
		extrafilter[e.target.name] = e.target.value;
		this.setState({ extrafilter });
	},

	handleChange: function (value) {
		this.setState({
			value: value,
		});
	},
	componentDidMount() {
		fetch(baseUrl + '/api/items', {
			method: "GET",
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
			credentials: "same-origin"
		}).then(response => {
			if (response.ok) {
				response.json().then(res => {
					res.sort(() => { return (0.5 - Math.random()); });
					res = res.slice(0, 5);
					this.setState({ items: res });
					console.log(res);
				});
			}
		});
	},
	handleTabChange(tabNo) {
		this.setState({ isLoading: true });
		this.setState({ items: [] });
		let feed = ''
		switch (tabNo) {
			case 0:
				feed = 'items'
			case 1:
				feed = 'items/top';
				break
			case 2:
				feed = Auth.isUserAuthenticated() ? 'recommendation/user' : 'items/';
				break
			case 3:
				feed = 'items/new';
				break
			default:
				break;
		}
		const headers = {
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json",
		}
		if (Auth.isUserAuthenticated()) headers.authorization = "token " + Auth.getToken()
		fetch(baseUrl + '/api/' + feed, {
			method: "GET",
			headers,
			credentials: "same-origin"
		}).then(response => {
			if (response.ok) {
				response.json().then(res => {
					if (tabNo === 0) {
						res.sort(() => { return (0.5 - Math.random()); });
						res = res.slice(0, 5);
					}
					this.setState({ items: res });
					this.setState({ isLoading: false })
					console.log(res);
				});
			}
		});
	},
	handleUserInput: function (filterText, inStockOnly) {
		this.setState({
			filterText: filterText
		});
	},
	onSearch(e) {
		e.preventDefault();
		const extrafilter = this.state.extrafilter;
		if (extrafilter.location === '') delete extrafilter.location;
		if (extrafilter.creator === '') delete extrafilter.creator;
		console.log(this.state.filterText);
		fetch(baseUrl + '/api/search', {
			method: "POST",
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			},
			credentials: "same-origin",
			body: JSON.stringify({
				query: this.state.filterText,
				filters: extrafilter
			})
		}).then(response => {
			if (response.ok) {
				response.json().then(res => {
					this.setState({ items: res });
					console.log(res);
				});
			}
		});
	},
	onToggle(event) {
		event.preventDefault();
		this.setState({
			hideAdvanced: !this.state.hideAdvanced,
			extrafilter: {
				location: '',
				creator: ''
			}
		})
	},
	onItemDelete() {
		console.log(this.state.intendedIndex);
		fetch(baseUrl + `/api/items/${this.state.items[this.state.intendedIndex].id}`, {
			method: "DELETE",
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json",
				"authorization": "token " + Auth.getToken()
			},
			credentials: "same-origin"
		}).then(response => {
			if (response.ok) {
				window.location.reload();
			}
		});

	},
	render() {
		const actions = [
			<FlatButton
				label="Cancel"
				primary={true}
				onClick={this.handleDialogClose}
			/>,
			<FlatButton
				label="Delete"
				secondary={true}
				onClick={this.onItemDelete}
			/>,
		];
		return (
			<div style={{ marginBottom: '50px' }}>
				<Dialog
					actions={actions}
					modal={false}
					open={this.state.dialogOpen}
					onRequestClose={this.handleDialogClose}
				>
					Remove Your Cultural Heritage?
				</Dialog>
				<TopBar auth={Auth.isUserAuthenticated()} />
				<div style={{ width: '50%', margin: 'auto' }}>
					<SearchBar
						filterText={this.state.filterText}
						inStockOnly={this.state.inStockOnly}
						onUserInput={this.handleUserInput}
						onSubmit={this.onSearch}
						onToggle={this.onToggle}
					/>
					<div>
						<Form inline style={this.state.hideAdvanced ? { display: 'none' } : {}}>
							<Col sm={4} xs={4} lg={4} style={{ padding: '4px' }}>
								<FormGroup bsSize="small" style={{ display: '-webkit-inline-box', width: '100%' }}>
									<ControlLabel className="col-sm-3 col-xs-3 col-lg-3">Location</ControlLabel>
									{' '}
									<FormControl
										className="col-sm-9 col-xs-9 col-lg-9"
										type="text"
										placeholder="Location..."
										style={{ marginLeft: '4px' }}
										name="location"
										value={this.state.extrafilter.location}
										onChange={this.onAdvancedSearchChange}
									/>
								</FormGroup>
							</Col>
							{' '}
							<Col sm={4} xs={4} lg={4} style={{ padding: '4px' }}>
								<FormGroup bsSize="small" style={{ display: '-webkit-inline-box', width: '100%' }}>
									<ControlLabel className="col-sm-3 col-xs-3 col-lg-3">Creator</ControlLabel>
									{' '}
									<FormControl
										className="col-sm-9 col-xs-9 col-lg-9"
										type="text"
										placeholder="Creator name..."
										style={{ marginLeft: '4px' }}
										name="creator"
										value={this.state.extrafilter.location}
										onChange={this.onAdvancedSearchChange}
									/>
								</FormGroup>
							</Col>
							<div className="col-sm-3 col-xs-3 col-md-3"></div>
							<Col sm={1} xs={1} lg={1} style={{ paddingLeft: '5px', paddingRight: '5px' }}>
								<FormGroup style={{ display: '-webkit-inline-box', width: '100%' }}>
									<Button
										className="col-sm-12 col-xs-12 col-lg-12"
										type="submit"
										bsStyle="primary"
										bsSize="small"
										onClick={this.onSearch}>Search</Button>
								</FormGroup>
							</Col>

						</Form>
					</div>
					{this.renderTabs()}
				</div>
			</div>
		);
	},
	renderTabs() {
		return (
			<div>
				<Tabs
					value={this.state.value}
					onChange={this.handleChange}
					style={{ marginTop: '5px' }}
					tabItemContainerStyle={{ backgroundColor: '#0091EA' }}
					inkBarStyle={{ backgroundColor: '#01579B' }}
				>
					<Tab label="Random" value="a" onActive={() => this.handleTabChange(0)}>
						{this.renderTab()}
					</Tab>
					<Tab label="Best" value="b" onActive={() => this.handleTabChange(1)}>
						{this.renderTab()}
					</Tab>
					<Tab label={Auth.isUserAuthenticated() ? "Recommended" : "Trending"} value="c" onActive={() => this.handleTabChange(2)}>
						{this.renderTab()}
					</Tab>
					<Tab label="New" value="d" onActive={() => this.handleTabChange(3)}>
						{this.renderTab()}
					</Tab>
				</Tabs>
			</div>
		);
	},
	renderTab() {
		return (
			<div>
				<div style={this.state.isLoading ? { marginLeft: '35%', padding: '50px' } : { display: 'none' }}>
					<CircularProgress size={80} thickness={7} />
				</div>
				{this.state.items.map((item, index) => (
					<div style={{ marginTop: '20px' }}>
						<Card style={{ backgroundColor: '#B3E5FC' }}>
							<a className="nav-link" href={'/item/' + item.id}>
								<CardHeader
									title={item.creator_username}
									subtitle={item.creation_date.substring(0, 10)}
									avatar={baseUrl + item.creator_image_path}
								/>

								<CardTitle title={item.title} />
							</a>
							<CardText style={{ paddingBottom: '48px' }}>
								{(item.description.length > 300) ?
									item.description.substring(0, 300) + "..." :
									item.description
								}
							</CardText>
							{Auth.getUsername() === item.creator_username ? (
								<div style={{ float: 'right', marginTop: '-32px', display: 'inline' }}>
									<a href={"/item/edit/" + item.id}>
										<i className={"material-icons md-24"}>mode_edit</i>
									</a>
									<button style={buttonStyle} onClick={() => { this.handleDialogOpen(index) }} >
										<i className={"material-icons md-24 red800"}>delete</i>
									</button>
								</div>
							) : (<br />)}
						</Card>
					</div>
				))}
			</div>
		);
	}
});


/* const HomePage = () => (
  <div>
  	<TopBar auth={Auth.isUserAuthenticated()}/>
  	<div>
			<SearchBar/>
		</div>
  </div>
); */

const SearchBar = React.createClass({
	handleChange: function () {
		this.props.onUserInput(
			this.refs.filterTextInput.value
		);
	},
	render: function () {
		return (
			<form onSubmit={this.props.onSubmit} >
				<FormGroup style={{ marginBottom: '5px' }}>
					<InputGroup style={{ display: 'flex' }}>
						<input
							type="text"
							placeholder="Search..."
							value={this.props.filterText}
							ref="filterTextInput"
							onChange={this.handleChange}
							style={inputStyle}
						/>
						<input type="submit" style={{ display: 'none' }} />
						<button style={buttonStyle} onClick={this.props.onToggle}>
							<img src="http://www.pvhc.net/img6/qelyglamexpdbblhacjf.png" style={{ height: '32px', width: '32px', marginLeft: '-36px' }} />
						</button>
					</InputGroup>
				</FormGroup>

			</form>
		);
	}
});

const inputStyle = {
	width: 'calc(100% )',
	height: '36px',
	padding: '12px 20px',
	margin: '8px 0',
	display: 'inline-block',
	border: '2px solid #ccc',
	borderRadius: '10px',
	boxSizing: 'border-box',
	outline: 'none'
}
const tabStyles = {
	headline: {
		fontSize: 24,
		paddingTop: 16,
		marginBottom: 12,
		fontWeight: 400,
	},
};

const buttonStyle = {
	background: 'transparent',
	borderWidth: 0,
	outline: 'none',
	padding: 0
}

export default HomePage;
