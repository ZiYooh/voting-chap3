import Web3 from "web3";
import votingArtifact from "../../build/contracts/Voting.json";

let candidates = {}
let pricePerToken;

const App = {
    web3: null,
    account: null,
    voting: null,
    contractAddress: null,

    start: async function () {
        const {web3} = this;

        try {
            // get contract instance
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = votingArtifact.networks[networkId];
            this.contractAddress = deployedNetwork.address;
            this.voting = new web3.eth.Contract(votingArtifact.abi, deployedNetwork.address,);

            // get accounts
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];

            this.populateCandidates();

        } catch (error) {
            console.log(error);
            console.error("Could not connect to contract or chain.");
        }
    },

    populateCandidates: async function () {
        await this.loadCandidates();
        this.setupCandidateRows();
    },

    loadCandidates: async function () {
        const {allCandidates} = this.voting.methods;

        let candidateArray = await allCandidates().call();
        for (let i = 0; i < candidateArray.length; i++) {
            /* We store the candidate names as bytes32 on the blockchain. We use the
    * handy toUtf8 method to convert from bytes32 to string
    */
            candidates[this.web3.utils.hexToUtf8(candidateArray[i])] = "candidate-" + i;
        }
    },

    setupCandidateRows: function () {
        Object.keys(candidates).forEach(function (candidate) {
          $("#candidate-rows").append("" + candidate + "");
        });
    }
};

window.App = App;

window.addEventListener("load", function () {
    if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        window.ethereum.enable(); // get permission to access accounts
    } else {
        console.warn(
            "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove thi" +
                    "s fallback when you deploy live",
        );
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id
        // mgmt / fail)
        App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"),);
    }

    App.start();
});