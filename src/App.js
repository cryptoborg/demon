import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import './App.css'
import './css/demo.css'
import './css/normalize.css'
import './css/webflow.css'

const CONTEST_CONTRACT_ADDRESS = "0x9a73c3E8c3687A01bE6154069F24f39616cA47Aa";
const CONTEST_ABI = [{"constant":true,"inputs":[{"name":"_contestant","type":"address"}],"name":"isInContest","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"joinContest","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"contestantsList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"winnersCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contestantsInfo","outputs":[{"name":"isInContest","type":"bool"},{"name":"initialBetAmount","type":"uint256"},{"name":"contestantIndex","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"winnerPercentage","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claimRefund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"leaveContest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"deposited","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_startTime","type":"uint256"},{"name":"_winnerPercentage","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_contestant","type":"address"},{"indexed":false,"name":"_wagerAmount","type":"uint256"}],"name":"JoinContest","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_contestant","type":"address"}],"name":"LeaveContest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"beneficiary","type":"address"},{"indexed":false,"name":"weiAmount","type":"uint256"}],"name":"Refunded","type":"event"}]

class WagerForm  extends Component {
    constructor(props) {
        super(props)
        this.state = {
            web3: null,
            username: '',
            amountOfEthWager: '',
            account0: '',
            account0Balance: 0,
            account0RefundBalance: 0,
            account0InGame: false,
            ContractInstance: null,
            mainButtonClassName: 'w-button',
            mainButtonLabel: '',
            refundAvailable: false,
            refundButtonLabel: '',
            refundButtonClassName: 'w-button-blue',
            handleMainButtonSubmit: this.handleJoinContest
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleJoinContest = this.handleJoinContest.bind(this)
        this.handleLeaveContest = this.handleLeaveContest.bind(this)
        this.handleClaimRefund = this.handleClaimRefund.bind(this)
        this.refreshBalance = this.refreshBalance.bind(this)
        this.instantiateContract = this.instantiateContract.bind(this)
        this.setJoinButton = this.setJoinButton.bind(this)
        this.setLeaveButton = this.setLeaveButton.bind(this)
        this.setJoiningButton = this.setJoiningButton.bind(this)
        this.setLeavingButton = this.setLeavingButton.bind(this)
        this.setRefundButton = this.setRefundButton.bind(this)
        this.setRefundingButton = this.setRefundingButton.bind(this)
    }

    componentWillMount() {
        // Get network provider and web3 instance.
        // See utils/getWeb3 for more info.

        getWeb3.then((results) => {
            return this.setState({ web3: results.web3 }, () => {
                this.instantiateContract()
            })
        }).catch(() => {
            alert('Error finding web3.')
        })
    }

    getBalance(address) {
        return new Promise (function (resolve, reject) {
            window.web3.eth.getBalance(address, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }

    getGasPrice() {
        return new Promise (function (resolve, reject) {
            window.web3.eth.getGasPrice(function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }

    getIsInContest(contestantAddress) {
        var thisObj = this;
        this.state.ContractInstance.isInContest.call(contestantAddress, function (error, result) {
            if (!error) {
                console.log('getIsInContest: ' + result);
                thisObj.setState({ account0InGame : result }, () => {
                    thisObj.getRefundAmount(contestantAddress)
                    if (result) {
                        thisObj.setLeaveButton()
                    } else {
                        thisObj.setJoinButton()
                    }
                })
            }
        })
    }

    getRefundAmount(contestantAddress) {
        var thisObj = this;
        this.state.ContractInstance.deposited.call(contestantAddress, function(error, result){
            console.log('getRefundAmount: ' + result);
            thisObj.setState({ account0RefundBalance : result } , () => {
                thisObj.setState({ refundAvailable : (result > 0 && !thisObj.state.account0InGame) })
                thisObj.setRefundButton()
            })
        });
    }

    setJoinButton() {
        this.setState({ handleMainButtonSubmit : this.handleJoinContest }, () => {
            this.setState({ mainButtonClassName : 'w-button-green' })
            this.setState({ mainButtonLabel : 'Join Contest' })
        })
    }

    setLeaveButton() {
        this.setState({ handleMainButtonSubmit : this.handleLeaveContest }, () => {
            this.setState({ mainButtonClassName : 'w-button-orange' })
            this.setState({ mainButtonLabel : 'Leave Contest' })
        })
    }

    setJoiningButton() {
        this.setState({ mainButtonClassName : 'w-button-yellow' })
        this.setState({ mainButtonLabel : 'Joining ...' })
    }

    setLeavingButton() {
        this.setState({ mainButtonClassName : 'w-button-yellow' })
        this.setState({ mainButtonLabel : 'Leaving ...' })
    }

    setRefundingButton() {
        this.setState({ refundButtonClassName : 'w-button-yellow' })
        this.setState({ refundButtonLabel : 'Claiming Refund ' + this.state.web3.utils.fromWei(this.state.account0RefundBalance.toString(), 'ether') + ' ETH ...'})
    }

    setRefundButton() {
        this.setState({ refundButtonClassName : 'w-button-blue' })
        this.setState({ refundButtonLabel : 'Claim Refund of ' + this.state.web3.utils.fromWei(this.state.account0RefundBalance.toString(), 'ether') + ' ETH'})
    }

    refreshBalance() {
        this.getBalance(this.state.account0).then((result) => {
            var balance = this.state.web3.utils.fromWei(result.toString(), 'ether')
            this.setState({ account0Balance: balance })
        });
    }

    instantiateContract() {
        const ContestContract = window.web3.eth.contract(CONTEST_ABI)
        this.setState({ ContractInstance: ContestContract.at(CONTEST_CONTRACT_ADDRESS) }, () => {

        // Get accounts.
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.setState({ account0: accounts[0] })
            this.getBalance(accounts[0]).then((result) => {
                
                var balance = this.state.web3.utils.fromWei(result.toString(), 'ether')
                this.setState({ account0Balance: balance })
            });

            this.setState({ contestPricePool: 0 })

            var joinContestEvent = this.state.ContractInstance.JoinContest({fromBlock:'latest'});
            var leaveContestEvent = this.state.ContractInstance.LeaveContest({fromBlock:'latest'});
            var refundedEvent = this.state.ContractInstance.Refunded({fromBlock:'latest'});

            var thisObj = this;
            // Watch for join and leave contest events
            joinContestEvent.watch(function(error, result){
                if (error) {
                    alert('Error: ' + error)
                } else {
                    console.log('Event JoinContest received')
                    thisObj.refreshBalance()
                    thisObj.setLeaveButton();
                }
            });
    
            leaveContestEvent.watch(function(error, result){
                if (error) {
                    alert('Error: ' + error)
                } else {
                    console.log('Event LeaveContest received')
                    thisObj.refreshBalance()
                    thisObj.setJoinButton()
                    thisObj.getRefundAmount(accounts[0])
                }
            });

            refundedEvent.watch(function(error, result){
                if (error) {
                    alert('Error: ' + error)
                } else {
                    console.log('Event Refunded received')
                    thisObj.refreshBalance()
                    thisObj.getRefundAmount(accounts[0])
                }
            });

            this.getIsInContest(accounts[0])

            /*
            simpleStorage.deployed().then((instance) => {
                simpleStorageInstance = instance
    
                // Stores a given value, 5 by default.
                return simpleStorageInstance.set(5, {from: accounts[0]})
            }).then((result) => {
                // Get the value from the contract to prove it worked.
                return simpleStorageInstance.get.call(accounts[0])
            }).then((result) => {
                // Update state with the result.
                return this.setState({ storageValue: result.c[0] })
            })
            */
            })
        })
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;

        this.setState({
            [name]: value
        });
    }

    handleJoinContest(event) {
        event.preventDefault();
        if (this.state.amountOfEthWager === '')
        {
            alert('Please fill in Wager Amount')
            return
        }

        /*
        var gasPrice = this.state.web3.eth.gasPrice;
        this.getGasPrice().then((result) => {
            var balance = this.state.web3.utils.fromWei(result.toString(), 'ether')
            alert(balance)
        });
        */

        this.state.ContractInstance.joinContest({
            gas: 300000,
            from: this.state.account0,
            value: this.state.web3.utils.toWei(this.state.amountOfEthWager, 'ether')
        }, (err, result) => {
            this.setJoiningButton()
        })
        this.setState({ refundAvailable : false })
    }

    handleLeaveContest(event) {
        event.preventDefault();
        this.state.ContractInstance.leaveContest({
            gas: 300000,
            from: this.state.account0
        }, (err, result) => {
            this.getRefundAmount(this.state.account0)
            this.setLeavingButton()
        })
    }

    handleClaimRefund(event) {
        event.preventDefault();
        this.state.ContractInstance.claimRefund({
            gas: 300000,
            from: this.state.account0
        }, (err, result) => {
            console.log('Claim Refund Pending ...')
            this.setRefundingButton()
        })
    }

    render() {
        return(
            <div className="WagerForm">
            <div className="timertext_div w-clearfix">
                <div className="address_text">ADDRESS:</div>
            </div>
            <div className="timertext_div w-clearfix">
                <div className="address">{this.state.account0}</div>
            </div>
            <div className="timertext_div w-clearfix">
                <div className="address_text">BALANCE:</div>
            </div>
            <div className="timertext_div w-clearfix">
                <div className="address">{this.state.account0Balance} ETH</div>
            </div>
            <form id="contest-form" name="contest-form" className="join-form" onSubmit={this.state.handleMainButtonSubmit}>
                <label htmlFor="name">Username</label>
                <input type="text" className="w-input" maxLength="256" name="username" placeholder="Enter username. For leaderboard display" id="username"
                    value={this.state.username}
                    onChange={this.handleInputChange} />
                <label htmlFor="wager">Wager Amount</label>
                <input type="number" className="w-input" maxLength="256" name="amountOfEthWager" id="ethwager" required=""
                    value={this.state.amountOfEthWager}
                    onChange={this.handleInputChange} />
                <input type="submit" value={this.state.mainButtonLabel} className={this.state.mainButtonClassName} />
            </form>
            { this.state.refundAvailable ?
                <form id="contest-claim-refund-form" name="contest-claim-refund-form" className="join-form" onSubmit={this.handleClaimRefund}>
                    <input type="submit" value={this.state.refundButtonLabel} className={this.state.refundButtonClassName} />
                </form> : null }
            </div>
        );
    }
}

class ContestInfoForm  extends Component {
    constructor(props) {
        super(props)
        this.state = {
            web3: null,
            contestPricePool : 0
        }
    }

    componentWillMount() {
        // Get network provider and web3 instance.
        // See utils/getWeb3 for more info.

        getWeb3.then((results) => {
            return this.setState({ web3: results.web3 })
        }).then((result) => {
            return this.getContestPricePool()
        }).then((result) => {
            var balance = this.state.web3.utils.fromWei(result.toString(), 'ether')
            return this.setState({ contestPricePool: balance })
        }).catch(() => {
            alert('Error finding web3.')
        })
    }

    getContestPricePool() {
        return new Promise (function (resolve, reject) {

            window.web3.eth.getBalance(CONTEST_CONTRACT_ADDRESS, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }

    render() {
        return(
            <div className="info_text">{this.state.contestPricePool} ETH</div>
        );
    }
}

class App extends Component {
    render() {
        return (
            <div>
            <div data-w-id="ff392bad-c758-56a2-04d5-d7ccbf7aae89" className="overlay">
            </div>
            <div className="wrapper w-clearfix">
                <div className="gamestatus_div w-clearfix">
                <div className="status_container">
                <div className="logo"></div>
                    <div className="status_row w-row">
                    <div className="status_column w-col w-col-4" data-ix="hover-status">
                        <div className="status_box" data-ix="status-fade">
                        <div className="counter">12</div>
                        </div>
                        <div className="status_text" data-ix="hover-status">Upcoming</div>
                    </div>
                    <div className="status_column w-col w-col-4">
                        <div className="status_box" data-ix="status-fade">
                        <div className="counter">08</div>
                        </div>
                        <div className="status_text" data-ix="hover-status">In Progress</div>
                    </div>
                    <div className="status_column w-col w-col-4">
                        <div className="status_box" data-ix="status-fade">
                        <div className="counter">06</div>
                        </div>
                    <div className="status_text" data-ix="hover-status">Completed</div>
                    </div>
                </div>
                </div>
            </div>
            <div className="contest_wrapper">
                <div className="game_container w-clearfix">
                <div className="game-header-div">
                    <div className="game_header"><span className="contract-link"></span><span className="link_contract"></span> AGON PUBLIC CONTEST #0</div>
                </div>
                <div className="game-info-div w-clearfix">
                    <div className="game_row w-row">
                    <div className="game_column w-col w-col-3">
                        <div className="info_icon"></div>
                        <div className="info">PLAYERS</div>
                    </div>
                    <div className="game_column w-col w-col-3">
                        <div className="info_text">-----</div>
                    </div>
                    <div className="game_column w-col w-col-3">
                        <div className="info_icon"></div>
                        <div className="info">RULE</div>
                    </div>
                    <div className="game_column w-col w-col-3">
                        <div className="info_text">Top 50% Players</div>
                    </div>
                    </div>
                    <div className="game_row w-row">
                    <div className="game_column w-col w-col-3">
                        <div className="info_icon"></div>
                        <div className="info">PRIZE POOL</div>
                    </div>
                    <div className="game_column w-col w-col-3">
                        <ContestInfoForm />
                    </div>
                    <div className="game_column w-col w-col-3">
                        <div className="info_icon"></div>
                        <div className="info">DURATION</div>
                    </div>
                    <div className="game_column w-col w-col-3">
                        <div className="info_text">72 Hours</div>
                    </div>
                    </div>
                </div>
                <div className="timer_div">
                    <div className="timertext_div w-clearfix">
                    <div className="timer_text">BETTING ENDS IN</div>
                    <div className="time">13:05:23</div>
                    </div>
                    <div className="timer_counter w-clearfix">
                    <div className="time_past"></div>
                    <div className="time_left"></div>
                    </div>
                <WagerForm />
                </div>
                </div>
            </div>
            </div>
        </div>
        );
    }
}

export default App;
