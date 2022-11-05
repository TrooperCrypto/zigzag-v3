import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract Vault is ERC20 {
  // The manager of a vault is allowed to sign orders that a vault can execute
  address manager;

  constructor(address _manager, string memory _name, string memory _symbol) ERC20(_name, _symbol) {
    manager = _manager;
  }

  function updateManager(address newManager) public {
    require(msg.sender == manager, "only manager can update manager");
    manager = newManager;
  }

  /////////////////////////////////////////////////////////////////////
  // The manager can use mintLPToken and burnLPToken to set LP limits 
  // The LP tokens are then swapped for user funds

  function mintLPToken(uint amount) public {
    require(msg.sender == manager, "only manager can mint LP tokens");
    _mint(address(this), amount);
  }

  function burnLPToken(uint amount) public {
    require(msg.sender == manager, "only manager can burn LP tokens");
    _burn(address(this), amount);
  }


  ////////////////////////////////////////////////////
  // EIP-1271 Smart Contract Signatures

  // This is a convenience function so off-chain signature verifications don't have to worry about 
  // magic numbers
  function isValidSignatureNow(bytes32 digest, bytes memory signature) public view returns (bool) {
    return SignatureChecker.isValidSignatureNow(manager, digest, signature);
  }
  
  // EIP-1271 requires isValidSignature to return a magic number if true and 0x00 if false 
  function isValidSignature(bytes32 digest, bytes memory signature) public view returns (bytes4) {
    return SignatureChecker.isValidSignatureNow(manager, digest, signature) ? bytes4(0x1626ba7e) : bytes4(0x00000000);
  }

}
