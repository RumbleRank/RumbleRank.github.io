const { HashRouter, Route, Link } = ReactRouterDOM;

let globalState = {listName: "", list: []};

function selectList(listName, list) {
	globalState["listName"] = listName;
	globalState["list"] = list;
}

class TreeNode {
    constructor(val) {
        this.val = val;
        this.lchild = null;
        this.rchild = null;
        this.parent = null;
    }

    totalNodes() {
        let lchildren = 0;
        let rchildren = 0;
        if (this.lchild) {
            lchildren = this.lchild.totalNodes();
        }
        if (this.rchild) {
            rchildren = this.rchild.totalNodes();
        }
        return lchildren + rchildren + 1;
    }

    depth() {
        let ldepth = 1;
        let rdepth = 1;
        if (this.lchild) {
            ldepth = this.lchild.depth() + 1;
        }
        if (this.rchild) {
            rdepth = this.rchild.depth() + 1;
        }
        return Math.max(ldepth, rdepth);
    }

    toList() {
        let llist = [];
        let rlist = [];
        if (this.lchild) {
            llist = this.lchild.toList();
        }
        if (this.rchild) {
            rlist = this.rchild.toList();
        }
        return [...rlist, this.val, ...llist];
    }

    setLeftChild(value) {
        this.lchild = new TreeNode(value);
        this.lchild.parent = this;
    }

    setRightChild(value) {
        this.rchild = new TreeNode(value);
        this.rchild.parent = this;
    }

    getTreeRoot() {
        if (this.parent) {
            return this.parent.getTreeRoot();
        }
        return this;
    }
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
		this.state = {red: "", blue: "", inputList: [], comparing: null, deciding: null};
        this.nextComparison = this.nextComparison.bind(this);
	}

	componentDidMount() {
		if (!globalState.listName) {
			this.props.history.push("/");
		}
        let list = globalState.list;
        let idx = Math.floor(Math.random() * list.length);
        let baseItem = list[idx];
        list = [...list.slice(0, idx), ...list.slice(idx + 1)];
        let baseNode = new TreeNode(baseItem);
        let decidingIdx = Math.floor(Math.random() * list.length);
        let decidingItem = list[decidingIdx];
        list = [...list.slice(0, decidingIdx), ...list.slice(decidingIdx + 1)];
        this.setState({list: list, comparing: baseNode, deciding: decidingItem});
	}

	render() {
        let comparingVal = "";
        let decidingVal = "";
        if (this.state.comparing) {
            comparingVal = this.state.comparing.val;
        }
        if (this.state.deciding) {
            decidingVal = this.state.deciding;
        }

		return(
			<div className="container-fluid h-100 p-2">
				<div className="row h-100">
					<div className="col-xs-12 col-sm-6 ShowdownCorner RedCorner" onClick={ () => this.nextComparison("comparing") }>
						{ comparingVal }
					</div>
					<div className="col-xs-12 col-sm-6 ShowdownCorner BlueCorner" onClick={ () => this.nextComparison("deciding") }>
						{ decidingVal }
					</div>
				</div>
			</div>
		);
	}

    nextComparison(winner) {
        if (winner === "comparing") {
            if (this.state.comparing.lchild) {
                this.setState({comparing: this.state.comparing.lchild});
            } else {
                let comparing = this.state.comparing;
                comparing.setLeftChild(this.state.deciding);
                let list = this.state.list;
                let decidingIdx = Math.floor(Math.random() * list.length);
                let decidingItem = list[decidingIdx];
                list = [...list.slice(0, decidingIdx), ...list.slice(decidingIdx + 1)];
                this.setState({list: list, comparing: comparing.getTreeRoot(), deciding: decidingItem}, this.checkIfDone);
            }
        } else if (winner === "deciding") {

            if (this.state.comparing.rchild) {
                this.setState({comparing: this.state.comparing.rchild});
            } else {
                let comparing = this.state.comparing;
                comparing.setRightChild(this.state.deciding);
                let list = this.state.list;
                let decidingIdx = Math.floor(Math.random() * list.length);
                let decidingItem = list[decidingIdx];
                list = [...list.slice(0, decidingIdx), ...list.slice(decidingIdx + 1)];
                this.setState({list: list, comparing: comparing.getTreeRoot(), deciding: decidingItem}, this.checkIfDone);
            }
        }
    }

    checkIfDone() {
        if (!this.state.deciding) {
            globalState.list = this.state.comparing.toList();
            this.props.history.push("/List");
        }
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