const { HashRouter, Route, Link } = ReactRouterDOM;

let globalState = {listName: "", list: []};
	
function selectList(listName, list) {
	globalState["listName"] = listName;
	globalState["list"] = list;
}

class RumbleContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
		return(
			<HashRouter>
				<Route exact path="/" component={RumbleMainMenu} />
				<Route path="/PresetLists" component={RumbleListsMenu} />
				<Route path="/CreateList" component={RumbleCreateList} />
				<Route path="/Showdown" component={RumbleShowdown} />
				<Route path="/List" component={RumbleListDisplay} />
			</HashRouter>
		);
    }
}

class RumbleMainMenu extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return(
			<div className="text-center">
				<h1 className="mb-4">RumbleRank</h1>
				<div className="container">
					<div className="row mb-4">
						<div className="col">
							<Link to="/PresetLists">
								<button type="button" className="btn btn-light">Preset List</button>
							</Link>
						</div>
					</div>
					<div className="row">
						<div className="col">
							<Link to="/CreateList">
								<button type="button" className="btn btn-light">Create List</button>
							</Link>
						</div>
					</div>
				</div>
			</div>
        );
    }
}

class RumbleListsMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {lists: {}, ready: false};
	}
	
	componentDidMount() {
		fetch("/lists.json")
		.then(r => r.json())
		.then(json => {
			this.setState({lists: json, ready: true});
		});
	}
	
	render() {
		if (this.state.ready) {
			return(
				<div className="text-center">
					<h1 className="mb-4">Choose a List</h1>
					<div className="container">
						{ Object.keys(this.state.lists).map(
							l => {
								return(
									<div className="mb-4">
										<Link to="/Showdown">
											<button type="button" className="btn btn-light" onClick={ () => selectList(l, this.state.lists[l]) }>{ l }</button>
										</Link>
									</div>
								);
							}
						)}
						<div>
							<Link to="/">
								<button  type="button" className="btn btn-light">Back</button>
							</Link>
						</div>
					</div>
				</div>
			);
		}
		
		return <div />;
	}
}

class RumbleCreateList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {list: []};
		this.addNewItem = this.addNewItem.bind(this);
		this.removeItem = this.removeItem.bind(this);
		this.submitList = this.submitList.bind(this);
	}
	
	addNewItem() {
		let newItem = document.getElementById("CustomListNewItem");
		this.setState({list: [...this.state.list, newItem.value]}, () => newItem.value = "");
	}
	
	removeItem(index) {
		let list = this.state.list;
		this.setState({list: [...list.slice(0,index), ...list.slice(index + 1)]});
	}
	
	submitList() {
		globalState.listName = document.getElementById("CustomListName").value;
		globalState.list = this.state.list;
	}
	
	render() {
		return(
			<div className="text-center">
				<div className="container">
					<input id="CustomListName" className="form-control mb-4" placeholder="List Title" />
					<ul>
						{ this.state.list.map((item, index) => {
							return <li className="mb-2"><span className="mr-2">{ item }</span><button type="button" className="btn btn-danger" onClick={ () => this.removeItem(index) }>X</button></li>
						}) }
						<li>
							<span className="CustomListNewListItemHolder">
								<input id="CustomListNewItem" placeholder="Add an item" className="form-control mr-2"/>
								<button type="button" className="btn btn-success" onClick={ this.addNewItem }>+</button>
							</span>
						</li>
					</ul>
					<div className="mb-2">
						<Link to="/Showdown">
							<button type="button" className="btn btn-primary" onClick={ this.submitList }>Rank!</button>
						</Link>
					</div>
					<div>
						<Link to="/">
							<button type="button" className="btn btn-light">Back</button>
						</Link>
					</div>
				</div>
			</div>
		);
	}
}

class RumbleShowdown extends React.Component {
	constructor(props) {
		super(props);
		this.state = {red: "", blue: "", comparisonsDone: 0};
		this.getNewItems = this.getNewItems.bind(this);
	}
	
	componentDidMount() {
		if (!globalState.listName) {
			this.props.history.push("/");
		}
		this.getNewItems();
	}
	
	render() {
		return(
			<div className="container-fluid h-100 p-2">
				<div className="row h-100">
					<div className="col-xs-12 col-sm-6 ShowdownCorner RedCorner" onClick={ this.getNewItems } >
						{ this.state.red }
					</div>
					<div className="col-xs-12 col-sm-6 ShowdownCorner BlueCorner" onClick={ this.getNewItems } >
						{ this.state.blue }
					</div>
				</div>
			</div>
		);
	}
	
	getNewItems() {
		let comparisonsDone = this.state.comparisonsDone + 1;
		let listLength = globalState.list.length;
		let redIdx = Math.floor(Math.random() * listLength);
		let blueIdx = Math.floor(Math.random() * listLength);
		if (comparisonsDone > 5) {
			this.props.history.push("/List");
		}
		this.setState({"red": globalState.list[redIdx], "blue": globalState.list[blueIdx], "comparisonsDone": comparisonsDone});
	}
}

class RumbleListDisplay extends React.Component {
	constructor(props) {
		super(props);
	}
	
	componentDidMount() {
		if (!globalState.listName) {
			this.props.history.push("/");
		}
	}
	
	render() {
		return(
			<div className="container text-center">
				<h1 className="mb-4">{ globalState.listName } Ranked</h1>
				<ol>
					{ globalState.list.map(item => {
						return <li>{item}</li>;
					}) }
				</ol>
				<Link to="/">
					<button  type="button" className="btn btn-light">Back</button>
				</Link>
			</div>
		);
	}
}

ReactDOM.render(<RumbleContainer />, document.getElementById("app"));