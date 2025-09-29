// 배포를 하기 위한 스크립트 생성

// 빌드 모듈
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// 빌드 모듈을 이용해서 contract를 불러오고 배포하는 스크립트
export default buildModule("MyTokenDeploy", (m) => {
  const myTokenC = m.contract("MyToken", ["MyToken", "MT", 18]);
  return { myTokenC };
});
