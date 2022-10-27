import { TagTypeModel } from "../models/tab-tag/tab-tag.model";
import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';

let tagTypeData: TagTypeModel[] = [
  { key: 'Hard', value: 'Hard' },
  { key: 'Sort', value: 'Sort' },
];

export class MockTabTypeApi {
  public getTagTypeData = (): Observable<ApiListResponse> => {
    let response = <ApiListResponse>{
      status: 1,
      message: '',
      content: <TagTypeModel[]>[...tagTypeData]
    };
    return Observable.create(observer => {
      observer.next(response);
      observer.complete();
    });
  }
}

const tagList = [
  {
    "locked": false,
    "lockedByUserID": null,
    "lockedDate": null,
    "tagId": "22343358-5796-4292-aeda-5a9495c22006",
    "tagNo": "PIT-112",
    "tagName": "PIT-112",
    "equipmentType": "EQM-1002",
    "tagType": "Hard",
    "system": "PumpPipe2",
    "subSystem": null,
    "workPackNo": "WP1",
    "parent": null,
    "locationCode": null,
    "discipline": "D2",
    "project": "GAS1111",
    "status": true,
    "locationId": null,
    "workPackId": "e06838d3-e565-4324-a413-846079fecc8b",
    "equipmentTypeId": "1689baf9-e4ad-470d-a807-55a05965087a",
    "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
    "systemId": "b33de9cf-d88f-483c-b023-3000ef152b2a",
    "subSystemId": null,
    "parentId": null,
    "referenceId": "b33de9cf-d88f-483c-b023-3000ef152b2a",
    "referenceTypeId": 1,
    "jobCardLookUpValueModels": [
      {
        "workPackNo": "WP1",
        "id": "c79b4df2-24b7-4c37-84f2-148d8b52a9bb",
        "value": "JC-1011"
      },
      {
        "workPackNo": "WP1",
        "id": "d467a3f2-231d-462b-bb35-254ad76d77ae",
        "value": "JC-1001"
      },
      {
        "workPackNo": "WP1",
        "id": "9e93a272-23d0-4346-88bf-2b3b60375730",
        "value": "JC-1014"
      },
      {
        "workPackNo": "WP1",
        "id": "55d94a7f-9ec8-47cc-b4d7-458eea36d50a",
        "value": "JC-1003"
      },
      {
        "workPackNo": "WP1",
        "id": "ef414330-4281-47af-95bc-4a017fa7544b",
        "value": "JC-1010"
      },
      {
        "workPackNo": "WP1",
        "id": "8fe1571a-3804-4a0d-ad3c-560a596e581c",
        "value": "JC-1009"
      },
      {
        "workPackNo": "WP1",
        "id": "4cf77a7a-de63-4aa0-8ca5-6350ed5a989a",
        "value": "JC2"
      },
      {
        "workPackNo": "WP1",
        "id": "f1120a44-ec4e-4c49-990e-8a128bec40d6",
        "value": "JC-1016"
      },
      {
        "workPackNo": "WP1",
        "id": "b8546a3a-d6d8-4dd2-a8c5-914b57aebff1",
        "value": "JC-1002"
      },
      {
        "workPackNo": "WP1",
        "id": "b9352139-90d7-400c-bf23-af2b1c9f4e28",
        "value": "JC3"
      },
      {
        "workPackNo": "WP1",
        "id": "c936a057-eca9-44ff-ac51-b990ba0fee54",
        "value": "JC-1006"
      },
      {
        "workPackNo": "WP1",
        "id": "ddbefbb9-1167-4d52-9477-c6c2ea7444bf",
        "value": "JC-1005"
      },
      {
        "workPackNo": "WP1",
        "id": "ac87ae84-d21e-497c-a514-da454ccf5b24",
        "value": "JC-1012"
      },
      {
        "workPackNo": "WP1",
        "id": "59da7504-9fa3-49d0-9188-df6de6511556",
        "value": "JC-1007"
      },
      {
        "workPackNo": "WP1",
        "id": "4173e68b-853f-4894-8ad4-eb4267e9c880",
        "value": "JC-1004"
      },
      {
        "workPackNo": "WP1",
        "id": "d5f967c6-d1f4-476b-a1dd-eb9c28037d52",
        "value": "JC-1008"
      },
      {
        "workPackNo": "WP1",
        "id": "dca8f6c4-68f2-4b77-a76a-ed886570b1cb",
        "value": "JC-1013"
      },
      {
        "workPackNo": "WP1",
        "id": "6709286b-5abc-48df-9bcb-f17a990698dc",
        "value": "JC-1017"
      },
      {
        "workPackNo": "WP1",
        "id": "2656a09c-eba2-4173-8d81-fb6001701023",
        "value": "JC-1015"
      }
    ],
    "tagSideMenu": {
      "itrs": [
        {
          "tagItrId": "a459d7e6-b681-4c09-b64b-20adde65711c",
          "tagNo": "PIT-112",
          "itrNo": "I01A",
          "itrId": "2f0217c4-e897-42f2-a925-0e8af3503b74",
          "tagId": "22343358-5796-4292-aeda-5a9495c22006",
          "status": "Completed",
          "itrDescription": "Instrument Installation",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
        {
          "tagItrId": "6c24ffb7-98fd-4e8f-8ee0-4b0ecef1181f",
          "tagNo": "PIT-112",
          "itrNo": "M01A",
          "itrId": "6eda0b86-39c6-4da2-aac7-07932bf0bc00",
          "tagId": "22343358-5796-4292-aeda-5a9495c22006",
          "status": "Inprogress",
          "itrDescription": "Mechanical Installation",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
        {
          "tagItrId": "cb9132c9-6e75-4c91-a8dd-91086dcd5315",
          "tagNo": "PIT-112",
          "itrNo": "MIA-16",
          "itrId": "0c293ac3-200b-4ec7-9e94-05f5e3ed9466",
          "tagId": "22343358-5796-4292-aeda-5a9495c22006",
          "status": "NotStarted",
          "itrDescription": "Alignment Check",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
        {
          "tagItrId": "9b0444d9-93c2-4ca8-8c21-9da2b5643666",
          "tagNo": "PIT-112",
          "itrNo": "MIIA",
          "itrId": "5b9c54de-7f44-403c-8c0e-803e5714571d",
          "tagId": "22343358-5796-4292-aeda-5a9495c22006",
          "status": "Completed",
          "itrDescription": "NUOCMIA",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
        {
          "tagItrId": "8c92f721-3ebd-4f0a-9a9c-c93d7a333676",
          "tagNo": "PIT-112",
          "itrNo": "ITRCa",
          "itrId": "7f389d74-3073-461a-b092-36062c37bf5b",
          "tagId": "22343358-5796-4292-aeda-5a9495c22006",
          "status": "NotStarted",
          "itrDescription": "des",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
        {
          "tagItrId": "dca8f199-784e-4f20-9675-df4d676eb4c2",
          "tagNo": "PIT-112",
          "itrNo": "MIA-17",
          "itrId": "2a9dc8d0-8be0-49d2-9a59-709770b7fba2",
          "tagId": "22343358-5796-4292-aeda-5a9495c22006",
          "status": "Waiting",
          "itrDescription": "ABC BAC",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        }
      ],
      "detailChart": {
        "tagId": "22343358-5796-4292-aeda-5a9495c22006",
        "tagNo": "PIT-112",
        "noOfItrCompleted": 3,
        "noOfItr": 10,
        "noOfPunchTypeACompleted": 0,
        "noOfPunchTypeA": 2,
        "noOfPunchTypeBCompleted": 0,
        "noOfPunchTypeB": 2,
        "noOfPunchTypeCCompleted": 0,
        "noOfPunchTypeC": 0,
        "noOfChangeActive": 2,
        "noOfChangeCompleted": 0
      },
      "detailTag": {
        "tagId": "22343358-5796-4292-aeda-5a9495c22006",
        "tagNo": "PIT-112",
        "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
        "disciplineCode": "D2",
        "systemId": "b33de9cf-d88f-483c-b023-3000ef152b2a",
        "systemNo": "PumpPipe2",
        "subSystemId": null,
        "subSystemNo": null,
        "locationId": null,
        "locationCode": null
      },
    },
  },
  {
    "locked": false,
    "lockedByUserID": null,
    "lockedDate": null,
    "tagId": "ad5dcfb1-5ec6-4579-96cf-0c576c8f520a",
    "tagNo": "TagNo-0101",
    "tagName": "Tag No Test 0001",
    "equipmentType": "EQMT2",
    "tagType": "",
    "system": "PumpPipe2",
    "subSystem": null,
    "workPackNo": "WP1",
    "parent": null,
    "locationCode": null,
    "discipline": null,
    "project": "GAS1111",
    "status": true,
    "locationId": null,
    "workPackId": "e06838d3-e565-4324-a413-846079fecc8b",
    "equipmentTypeId": "286ff901-84cf-44dd-9bd2-8b7a5c3fba51",
    "disciplineId": null,
    "systemId": "b33de9cf-d88f-483c-b023-3000ef152b2a",
    "subSystemId": null,
    "parentId": null,
    "referenceId": "b33de9cf-d88f-483c-b023-3000ef152b2a",
    "referenceTypeId": 1,
    "jobCardLookUpValueModels": [
      {
        "workPackNo": "WP1",
        "id": "c79b4df2-24b7-4c37-84f2-148d8b52a9bb",
        "value": "JC-1011"
      },
      {
        "workPackNo": "WP1",
        "id": "d467a3f2-231d-462b-bb35-254ad76d77ae",
        "value": "JC-1001"
      },
      {
        "workPackNo": "WP1",
        "id": "9e93a272-23d0-4346-88bf-2b3b60375730",
        "value": "JC-1014"
      },
      {
        "workPackNo": "WP1",
        "id": "55d94a7f-9ec8-47cc-b4d7-458eea36d50a",
        "value": "JC-1003"
      },
      {
        "workPackNo": "WP1",
        "id": "ef414330-4281-47af-95bc-4a017fa7544b",
        "value": "JC-1010"
      },
      {
        "workPackNo": "WP1",
        "id": "8fe1571a-3804-4a0d-ad3c-560a596e581c",
        "value": "JC-1009"
      },
      {
        "workPackNo": "WP1",
        "id": "4cf77a7a-de63-4aa0-8ca5-6350ed5a989a",
        "value": "JC2"
      },
      {
        "workPackNo": "WP1",
        "id": "f1120a44-ec4e-4c49-990e-8a128bec40d6",
        "value": "JC-1016"
      },
      {
        "workPackNo": "WP1",
        "id": "b8546a3a-d6d8-4dd2-a8c5-914b57aebff1",
        "value": "JC-1002"
      },
      {
        "workPackNo": "WP1",
        "id": "b9352139-90d7-400c-bf23-af2b1c9f4e28",
        "value": "JC3"
      },
      {
        "workPackNo": "WP1",
        "id": "c936a057-eca9-44ff-ac51-b990ba0fee54",
        "value": "JC-1006"
      },
      {
        "workPackNo": "WP1",
        "id": "ddbefbb9-1167-4d52-9477-c6c2ea7444bf",
        "value": "JC-1005"
      },
      {
        "workPackNo": "WP1",
        "id": "ac87ae84-d21e-497c-a514-da454ccf5b24",
        "value": "JC-1012"
      },
      {
        "workPackNo": "WP1",
        "id": "59da7504-9fa3-49d0-9188-df6de6511556",
        "value": "JC-1007"
      },
      {
        "workPackNo": "WP1",
        "id": "4173e68b-853f-4894-8ad4-eb4267e9c880",
        "value": "JC-1004"
      },
      {
        "workPackNo": "WP1",
        "id": "d5f967c6-d1f4-476b-a1dd-eb9c28037d52",
        "value": "JC-1008"
      },
      {
        "workPackNo": "WP1",
        "id": "dca8f6c4-68f2-4b77-a76a-ed886570b1cb",
        "value": "JC-1013"
      },
      {
        "workPackNo": "WP1",
        "id": "6709286b-5abc-48df-9bcb-f17a990698dc",
        "value": "JC-1017"
      },
      {
        "workPackNo": "WP1",
        "id": "2656a09c-eba2-4173-8d81-fb6001701023",
        "value": "JC-1015"
      }
    ],
    "tagSideMenu": {
      "itrs": [
        {
          "tagItrId": "2977dd31-c803-4826-8c70-b1756a7aa2b9",
          "tagNo": "TagNo-0101",
          "itrNo": "Itr-test-full",
          "itrId": "3d5e5ad2-0657-417c-b53d-60a2389d1d4d",
          "tagId": "ad5dcfb1-5ec6-4579-96cf-0c576c8f520a",
          "status": "Completed",
          "itrDescription": "Alignment Check",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
        {
          "tagItrId": "bf05ff29-5107-4c0b-aa30-f3f02db6b744",
          "tagNo": "TagNo-0101",
          "itrNo": "Itr-test-full",
          "itrId": "3d5e5ad2-0657-417c-b53d-60a2389d1d4d",
          "tagId": "ad5dcfb1-5ec6-4579-96cf-0c576c8f520a",
          "status": "Rejected",
          "itrDescription": "Alignment Check",
          "rejectReason": "dsfdf",
          "isAdded": null,
          "isDeleted": null
        }
      ],
      "detailChart": {
        "tagId": "ad5dcfb1-5ec6-4579-96cf-0c576c8f520a",
        "tagNo": "TagNo-0101",
        "noOfItrCompleted": 2,
        "noOfItr": 4,
        "noOfPunchTypeACompleted": 0,
        "noOfPunchTypeA": 0,
        "noOfPunchTypeBCompleted": 0,
        "noOfPunchTypeB": 0,
        "noOfPunchTypeCCompleted": 0,
        "noOfPunchTypeC": 0,
        "noOfChangeActive": 2,
        "noOfChangeCompleted": 0
      },
      "detailTag": {
        "tagId": "ad5dcfb1-5ec6-4579-96cf-0c576c8f520a",
        "tagNo": "TagNo-0101",
        "disciplineId": null,
        "disciplineCode": null,
        "systemId": "b33de9cf-d88f-483c-b023-3000ef152b2a",
        "systemNo": "PumpPipe2",
        "subSystemId": null,
        "subSystemNo": null,
        "locationId": null,
        "locationCode": null
      },
    },
  },
  {
    "locked": false,
    "lockedByUserID": null,
    "lockedDate": null,
    "tagId": "81684132-1052-4070-8ad0-4d82d55f50d0",
    "tagNo": "TagNo-0103",
    "tagName": "Tag No Test 0001",
    "equipmentType": "EQMT2",
    "tagType": "",
    "system": "SYS-1013",
    "subSystem": null,
    "workPackNo": "WP3",
    "parent": null,
    "locationCode": null,
    "discipline": null,
    "project": "GAS1111",
    "status": true,
    "locationId": null,
    "workPackId": "00f5fc3f-4a67-4197-b00f-7f761ae44252",
    "equipmentTypeId": "286ff901-84cf-44dd-9bd2-8b7a5c3fba51",
    "disciplineId": null,
    "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
    "subSystemId": null,
    "parentId": null,
    "referenceId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
    "referenceTypeId": 1,
    "jobCardLookUpValueModels": [
      {
        "workPackNo": "WP3",
        "id": "809b6c04-d305-4323-8b36-1fe2cfa9656c",
        "value": "jc1"
      }
    ],
    "tagSideMenu": {
      "itrs": [
      ],
      "detailChart": {
        "tagId": "81684132-1052-4070-8ad0-4d82d55f50d0",
        "tagNo": "TagNo-0103",
        "noOfItrCompleted": 0,
        "noOfItr": 1,
        "noOfPunchTypeACompleted": 0,
        "noOfPunchTypeA": 0,
        "noOfPunchTypeBCompleted": 0,
        "noOfPunchTypeB": 0,
        "noOfPunchTypeCCompleted": 0,
        "noOfPunchTypeC": 0,
        "noOfChangeActive": 0,
        "noOfChangeCompleted": 0
      },
      "detailTag": {
        "tagId": "81684132-1052-4070-8ad0-4d82d55f50d0",
        "tagNo": "TagNo-0103",
        "disciplineId": null,
        "disciplineCode": null,
        "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
        "systemNo": "SYS-1013",
        "subSystemId": null,
        "subSystemNo": null,
        "locationId": null,
        "locationCode": null
      },
    },
  },
  {
    "locked": false,
    "lockedByUserID": null,
    "lockedDate": null,
    "tagId": "b334d0f2-b782-4fd6-b690-9bd0d1e59e73",
    "tagNo": "TagNo-0105",
    "tagName": "Tag No Test 0001",
    "equipmentType": "EQ003",
    "tagType": "Hard",
    "system": "SYS-1013",
    "subSystem": null,
    "workPackNo": "WP3",
    "parent": null,
    "locationCode": null,
    "discipline": "D2",
    "project": "GAS1111",
    "status": true,
    "locationId": null,
    "workPackId": "00f5fc3f-4a67-4197-b00f-7f761ae44252",
    "equipmentTypeId": "8487912b-0978-4520-b496-0c19c241b905",
    "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
    "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
    "subSystemId": null,
    "parentId": null,
    "referenceId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
    "referenceTypeId": 1,
    "jobCardLookUpValueModels": [
      {
        "workPackNo": "WP3",
        "id": "809b6c04-d305-4323-8b36-1fe2cfa9656c",
        "value": "jc1"
      }
    ],
    "tagSideMenu": {
      "itrs": [
        {
          "tagItrId": "79e30c9d-c944-4f0c-bc7a-23631483aa5f",
          "tagNo": "TagNo-0105",
          "itrNo": "MIA-16",
          "itrId": "0c293ac3-200b-4ec7-9e94-05f5e3ed9466",
          "tagId": "b334d0f2-b782-4fd6-b690-9bd0d1e59e73",
          "status": "NotStarted",
          "itrDescription": "Alignment Check",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
        {
          "tagItrId": "be56dfc7-3c01-40fb-80da-583e2e601c4f",
          "tagNo": "TagNo-0105",
          "itrNo": "I01A",
          "itrId": "2f0217c4-e897-42f2-a925-0e8af3503b74",
          "tagId": "b334d0f2-b782-4fd6-b690-9bd0d1e59e73",
          "status": "NotStarted",
          "itrDescription": "Instrument Installation",
          "rejectReason": null,
          "isAdded": null,
          "isDeleted": null
        },
      ],
      "detailChart": {
        "tagId": "b334d0f2-b782-4fd6-b690-9bd0d1e59e73",
        "tagNo": "TagNo-0105",
        "noOfItrCompleted": 0,
        "noOfItr": 7,
        "noOfPunchTypeACompleted": 0,
        "noOfPunchTypeA": 0,
        "noOfPunchTypeBCompleted": 0,
        "noOfPunchTypeB": 0,
        "noOfPunchTypeCCompleted": 0,
        "noOfPunchTypeC": 0,
        "noOfChangeActive": 0,
        "noOfChangeCompleted": 0
      },
      "detailTag": {
        "tagId": "b334d0f2-b782-4fd6-b690-9bd0d1e59e73",
        "tagNo": "TagNo-0105",
        "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
        "disciplineCode": "D2",
        "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
        "systemNo": "SYS-1013",
        "subSystemId": null,
        "subSystemNo": null,
        "locationId": null,
        "locationCode": null
      },
    }
  },

];

export const recordDetail = {
  "a459d7e6-b681-4c09-b64b-20adde65711c": {
    "form": {
      "headerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"isir\" data-cell-of=\"Header\" class=\"cell\"><span data-custom-type=\"question\" id=\"iv9o\" data-answer-linked=\"igdp\">Do you want more?</span></div><div id=\"ibw4\" data-cell-of=\"Header\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"igdp\" data-answer-type=\"Checkbox\" data-question-linked=\"iv9o\" data-hidden-label=\"false\"><label data-custom-label=\"Yes\" id=\"ixjh\"><input type=\"checkbox\" data-checkbox-answer=\"igdp\" name=\"igdp\" value=\"Yes\" id=\"it0h1\"/>Yes\n            </label><label data-custom-label=\"No\" id=\"ipt1a\"><input type=\"checkbox\" data-checkbox-answer=\"igdp\" name=\"igdp\" value=\"No\" id=\"ibtat\"/>No\n            </label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"ibpt\" data-cell-of=\"Header\" class=\"cell\"></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"ijhzl\" data-cell-of=\"Header\" class=\"cell\"><span data-custom-type=\"question\" id=\"i8lji\" data-answer-linked=\"ib8rm\">OMG!!!</span></div><div id=\"ielsi\" data-cell-of=\"Header\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"ib8rm\" data-answer-type=\"Radio\" data-question-linked=\"i8lji\" data-hidden-label=\"false\"> <label data-custom-label=\"What is problem?\" id=\"iosal\"><input type=\"radio\" name=\"ib8rm\" value=\"What is problem?\" id=\"ibpqs\"/>What is problem?\n            </label> <label data-custom-label=\"na, it is not my work\" id=\"i3a6p\"><input type=\"radio\" name=\"ib8rm\" value=\"na, it is not my work\" id=\"ihbd8\"/>na, it is not my work\n            </label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i25vt\" data-cell-of=\"Header\" class=\"cell\"></div><div id=\"itk6u\" data-cell-of=\"Header\" class=\"cell\"></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#isir{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ibw4{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#ibpt{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#iv9o{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#ixjh{margin-right:10px;}#it0h1{margin-right:10px;}#ipt1a{margin-right:10px;}#ibtat{margin-right:10px;}#ijhzl{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ielsi{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i8lji{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#iosal{margin-right:10px;}#ibpqs{margin-right:5px;}#i3a6p{margin-right:10px;}#ihbd8{margin-right:5px;}#i25vt{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#itk6u{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"im1o\" data-cell-of=\"Body\" class=\"cell\"><span id=\"i8xx\">Body part</span></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i8p9\" data-cell-of=\"Body\" class=\"cell\"><span data-custom-type=\"question\" id=\"izg3\" data-answer-linked=\"ihx7f\">Where are you come from?</span></div><div id=\"i4sg\" data-cell-of=\"Body\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"ihx7f\" data-answer-type=\"Dropdown\" data-question-linked=\"izg3\" data-hidden-label=\"false\"><select name=\"ihx7f&quot;\" class=\"form-control\"><option data-custom-label=\"Viet nam\" value=\"Viet nam\">Viet nam</option><option data-custom-label=\"Japan\" value=\"Japan\">Japan</option><option data-custom-label=\"Italy\" value=\"Italy\">Italy</option></select><button class=\"hidden-sub\">Setup</button></answer-component></div></div>",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#im1o{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#i8p9{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#i4sg{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i8xx{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;display:inline-block;}#izg3{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "footerHtml": "<div data-custom-type=\"outer-most-row\" id=\"i78m\" class=\"row\"><div id=\"iwgu\" data-cell-of=\"Footer\" class=\"cell\"><img src=\"https://elementstorage.blob.core.windows.net/itr/637342097949761748_ItrUpload.png\" id=\"iyti\"/></div><div id=\"iq3d\" data-cell-of=\"Footer\" class=\"cell\"><span id=\"ifvu\">Satan</span></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"isro\" data-cell-of=\"Footer\" class=\"cell\"><free-text-from-database id=\"ioti4\" data-table-id=\"4\" data-field-id-from-table=\"11\" data-table-name=\"equipment\" data-field-name-from-table=\"Description\" data-custom-type=\"field-from-data-base-component\">[Description] from [Equipment] <button class=\"hidden-sub\">Choose field</button></free-text-from-database></div><div id=\"idig\" data-cell-of=\"Footer\" class=\"cell\"><free-text-from-database id=\"ipu7l\" data-table-id=\"6\" data-field-id-from-table=\"20\" data-table-name=\"itr\" data-field-name-from-table=\"Description\" data-custom-type=\"field-from-data-base-component\">[Description] from [Itr] <button class=\"hidden-sub\">Choose field</button></free-text-from-database></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i8zpj\" data-cell-of=\"Footer\" class=\"cell\"><span data-custom-type=\"question\" id=\"iv4rl\" data-answer-linked=\"i14cl\">what your name?</span></div><div id=\"ixfjl\" data-cell-of=\"Footer\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"i14cl\" data-answer-type=\"Input cell\" data-question-linked=\"iv4rl\" data-hidden-label=\"false\"><input type=\"text\" data-id=\"input-itr-editor\" disabled=\"\" name=\"i14cl\" placeholder=\"Input your answer\" class=\"form-control\"/><button class=\"hidden-sub\">Setup</button></answer-component></div></div>",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#iwgu{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;justify-content:center;}#iq3d{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#iyti{width:150px;}#i78m{height:278px;}#ifvu{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;display:inline-block;}#isro{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#idig{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ioti4{margin-left:5px;}#ipu7l{margin-left:5px;}#i8zpj{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ixfjl{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iv4rl{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}@media (max-width: 768px){.row{flex-wrap:wrap;}}"
    },
    "fieldData": {
      "itrNo": "I01A",
      "itrDescription": "Instrument Installation",
      "itrType": "Handover",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQM-1002",
      "equipmentDescription": "EQM-1002",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "PIT-112",
      "tagDescription": "PIT-112",
      "tagId": "22343358-5796-4292-aeda-5a9495c22006",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [
      {
        "id": "ae4134e0-e1fc-48f3-becd-02b06614a790",
        "question": {
          "customId": "iv9o",
          "value": "Do you want more?"
        },
        "answer": [
          {
            "customId": "igdp",
            "type": "CHECKBOX",
            "values": [
              "Yes\n            ",
              "No\n            "
            ]
          }
        ],
        "currentAnswer": "Yes"
      },
      {
        "id": "02918f30-e93a-414b-90c8-8e819e9a3798",
        "question": {
          "customId": "izg3",
          "value": "Where are you come from?"
        },
        "answer": [
          {
            "customId": "ihx7f",
            "type": "DROPDOWN",
            "values": [
              "Viet nam",
              "Japan",
              "Italy"
            ]
          }
        ],
        "currentAnswer": "Viet nam"
      },
      {
        "id": "5aeaaa5b-65e6-4628-9fc8-e287b7d60587",
        "question": {
          "customId": "iv4rl",
          "value": "what your name?"
        },
        "answer": [
          {
            "customId": "i14cl",
            "type": "INPUTCELL",
            "values": [
              "Input your answer"
            ]
          }
        ],
        "currentAnswer": "sadfadsf"
      },
      {
        "id": "e91cd28b-3077-495d-901a-ea7384e2af46",
        "question": {
          "customId": "i8lji",
          "value": "OMG!!!"
        },
        "answer": [
          {
            "customId": "ib8rm",
            "type": "RADIO",
            "values": [
              "What is problem?\n            ",
              "na, it is not my work\n            "
            ]
          }
        ],
        "currentAnswer": "na, it is not my work"
      }
    ],
    "signatures": [
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 3,
        "userName": "Admin Elements",
        "userCompany": "Google",
        "signDate": "2020-09-07T17:12:21.86",
        "label": "Signature of Leader"
      }
    ],
    "status": "Completed",
    "canAction": false
  },
  "6c24ffb7-98fd-4e8f-8ee0-4b0ecef1181f": {
    "form": {
      "headerHtml": "<div class=\"row\"><div id=\"iz1v\" data-cell-of=\"Header\" class=\"cell\"></div><div id=\"ie5h\" data-cell-of=\"Header\" class=\"cell\"><signatures-component id=\"i3g1\" data-signature-type=\"Manager\" data-signature-signatureId=\"9935492a-c634-40e3-84bd-9a77ae454515\">Signature of Leader <button class=\"hidden-sub\">Setup</button></signatures-component></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;}.cell{min-height:75px;flex-grow:1;flex-basis:100%;}#iz1v{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#ie5h{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "<div id=\"iiof\">Insert your text here</div>",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}#iiof{padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;}",
      "footerHtml": "<img id=\"ieeo\" src=\"https://elementstorage.blob.core.windows.net/project/637245430537828481_download.png\"/>",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}#ieeo{color:black;}"
    },
    "fieldData": {
      "itrNo": "M01A",
      "itrDescription": "Mechanical Installation",
      "itrType": "A",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQM-1002",
      "equipmentDescription": "EQM-1002",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "PIT-112",
      "tagDescription": "PIT-112",
      "tagId": "22343358-5796-4292-aeda-5a9495c22006",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [],
    "signatures": [
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 1,
        "userName": "Admin Elements",
        "userCompany": "Google",
        "signDate": "2020-10-27T14:33:39.8",
        "label": "Signature of Admin"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 3,
        "userName": " ",
        "userCompany": null,
        "signDate": null,
        "label": "Signature of Leader"
      }
    ],
    "status": "Inprogress",
    "canAction": true
  },
  "cb9132c9-6e75-4c91-a8dd-91086dcd5315": {
    "form": {
      "headerHtml": "<div class=\"row\"><div id=\"iyp9\" class=\"cell\"><span data-custom-type=\"question\" id=\"ilc3u\" data-answer-linked=\"ivusp\">Chán chua</span></div><div id=\"iq9n\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"ivusp\" data-answer-type=\"Checkbox\" data-question-linked=\"ilc3u\" data-hidden-label=\"false\"><label data-custom-label=\"yes\" id=\"i9zzu\"><input type=\"checkbox\" data-checkbox-answer=\"ivusp\" name=\"ivusp\" value=\"yes\" id=\"i6fa9\"/>yes</label><label data-custom-label=\"no\" id=\"iug7n\"><input type=\"checkbox\" data-checkbox-answer=\"ivusp\" name=\"ivusp\" value=\"no\" id=\"izebf\"/>no</label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div class=\"row\"><div id=\"ixml\" class=\"cell\"><span data-custom-type=\"question\" id=\"i3q8y\">Mu?n choi d?u móc?</span></div><div id=\"i4ht\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"i02lj\" data-answer-type=\"Input cell\" data-question-linked=\"izxgg\" data-hidden-label=\"false\"><input type=\"text\" name=\"i02lj\" placeholder=\"Th? 2\"/><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div class=\"row\"><div id=\"i6i5\" class=\"cell\"><span data-custom-type=\"question\" id=\"izxgg\" data-answer-linked=\"i02lj\">Hôm nay là th? m?y</span></div><div id=\"ik3h\" class=\"cell\"><answer-component data-custom-type=\"answer\">Answer <button class=\"hidden-sub\">Setup</button></answer-component></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}span{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#iyp9{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#iq9n{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#ixml{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#i4ht{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i6i5{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#ik3h{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#ilc3u{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#i3q8y{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#izxgg{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#i9zzu{margin-right:10px;}#i6fa9{margin-right:10px;}#iug7n{margin-right:10px;}#izebf{margin-right:10px;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}span{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}",
      "footerHtml": "",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}span{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}"
    },
    "fieldData": {
      "itrNo": "MIA-16",
      "itrDescription": "Alignment Check",
      "itrType": "C",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQM-1002",
      "equipmentDescription": "EQM-1002",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "PIT-112",
      "tagDescription": "PIT-112",
      "tagId": "22343358-5796-4292-aeda-5a9495c22006",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [],
    "signatures": null,
    "status": "NotStarted",
    "canAction": true
  },
  "9b0444d9-93c2-4ca8-8c21-9da2b5643666": {
    "form": {
      "headerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i3ei\" data-cell-of=\"Header\" class=\"cell\"><field-from-signature-component id=\"ino3w\" data-id-signature-linked=\"iaebf\" data-label-field-of-signature=\"Name\">[Name] from signature<button class=\"hidden-sub\">Setup</button></field-from-signature-component></div><div id=\"irsf\" data-cell-of=\"Header\" class=\"cell\"></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"iwhy\" data-cell-of=\"Header\" class=\"cell\"><field-from-signature-component id=\"ini8n\" data-id-signature-linked=\"iaebf\" data-label-field-of-signature=\"SignatureDate\">[SignatureDate] from signature<button class=\"hidden-sub\">Setup</button></field-from-signature-component></div><div id=\"i738\" data-cell-of=\"Header\" class=\"cell\"><signatures-component id=\"iaebf\" data-signature-type=\"Manager\" data-signature-signatureid=\"cb38f121-1ee6-4182-8a01-2389a20acdd7\" data-signature-label=\"Signature of Approver\">Signature of Approver <button class=\"hidden-sub\">Setup</button></signatures-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"iuij\" data-cell-of=\"Header\" class=\"cell\"><field-from-signature-component id=\"ip1z8\" data-id-signature-linked=\"iaebf\" data-label-field-of-signature=\"Name\">[Name] from signature<button class=\"hidden-sub\">Setup</button></field-from-signature-component></div><div id=\"ipit\" data-cell-of=\"Header\" class=\"cell\"></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#i3ei{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#irsf{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#iwhy{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#i738{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iuij{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ipit{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "",
      "bodyCss": "",
      "footerHtml": "",
      "footerCss": ""
    },
    "fieldData": {
      "itrNo": "MIIA",
      "itrDescription": "NUOCMIA",
      "itrType": "Handover",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQM-1002",
      "equipmentDescription": "EQM-1002",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "PIT-112",
      "tagDescription": "PIT-112",
      "tagId": "22343358-5796-4292-aeda-5a9495c22006",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [],
    "signatures": [
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 2,
        "userName": "Admin Elements",
        "userCompany": "Google",
        "signDate": "2020-09-07T17:10:48.047",
        "label": "Signature of Approver"
      }
    ],
    "status": "Completed",
    "canAction": false
  },
  "8c92f721-3ebd-4f0a-9a9c-c93d7a333676": {
    "form": {
      "headerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"ii2h\" data-cell-of=\"Header\" class=\"cell\"></div><div id=\"ij2x\" data-cell-of=\"Header\" class=\"cell\"><signatures-component id=\"itgf\">Signature <button class=\"hidden-sub\">Setup</button></signatures-component></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#ii2h{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#ij2x{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}",
      "footerHtml": "",
      "footerCss": ""
    },
    "fieldData": {
      "itrNo": "ITRCa",
      "itrDescription": "des",
      "itrType": "A",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQM-1002",
      "equipmentDescription": "EQM-1002",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "PIT-112",
      "tagDescription": "PIT-112",
      "tagId": "22343358-5796-4292-aeda-5a9495c22006",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [],
    "signatures": null,
    "status": "NotStarted",
    "canAction": true
  },
  "dca8f199-784e-4f20-9675-df4d676eb4c2": {
    "form": {
      "headerHtml": "<div data-custom-type=\"outer-most-row\" id=\"ikb7\" class=\"row\"><div id=\"ihhp\" data-cell-of=\"Header\" class=\"cell\"><span id=\"ix0k\">Update for testing</span></div><div id=\"i5lu\" data-cell-of=\"Header\" class=\"cell\"></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#ihhp{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#i5lu{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#ix0k{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;display:inline-block;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i6l8\" data-cell-of=\"Body\" class=\"cell\"><span data-custom-type=\"question\" id=\"igidj\" data-answer-linked=\"iz8cj\">Question 1</span></div><div id=\"iovw\" data-cell-of=\"Body\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"iz8cj\" data-answer-type=\"Radio\" data-question-linked=\"igidj\" data-hidden-label=\"false\"> <label data-custom-label=\"Yes\" id=\"ip76e\"><input type=\"radio\" name=\"iz8cj\" value=\"Yes\" id=\"ikt75\"/>Yes\n            </label> <label data-custom-label=\"No\" id=\"i1f5k\"><input type=\"radio\" name=\"iz8cj\" value=\"No\" id=\"ibelq\"/>No\n            </label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"ixpt\" data-cell-of=\"Body\" class=\"cell\"><span data-custom-type=\"question\" id=\"iwq8k\" data-answer-linked=\"isyon\">Question 2</span></div><div id=\"i2h2\" data-cell-of=\"Body\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"isyon\" data-answer-type=\"Radio\" data-question-linked=\"iwq8k\" data-hidden-label=\"false\"> <label data-custom-label=\"Yes\" id=\"iletg\"><input type=\"radio\" name=\"isyon\" value=\"Yes\" id=\"i28tf\"/>Yes\n            </label> <label data-custom-label=\"No\" id=\"ir258\"><input type=\"radio\" name=\"isyon\" value=\"No\" id=\"ikigp\"/>No\n            </label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i0kj\" data-cell-of=\"Body\" class=\"cell\"><span data-custom-type=\"question\" id=\"iw2gt\" data-answer-linked=\"itj3t\">Question 3</span></div><div id=\"iydq\" data-cell-of=\"Body\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"itj3t\" data-answer-type=\"Checkbox\" data-question-linked=\"iw2gt\" data-hidden-label=\"false\"><label data-custom-label=\"Yes\" id=\"ihe9s\"><input type=\"checkbox\" data-checkbox-answer=\"itj3t\" name=\"itj3t\" value=\"Yes\" id=\"ia3tn\"/>Yes\n            </label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i82wp\" data-cell-of=\"Body\" class=\"cell\"><span data-custom-type=\"question\" id=\"ivhv9\" data-answer-linked=\"ipl4g\">Question 4</span></div><div id=\"ih93l\" data-cell-of=\"Body\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"ipl4g\" data-answer-type=\"Dropdown\" data-question-linked=\"ivhv9\" data-hidden-label=\"false\"><select name=\"ipl4g&quot;\" class=\"form-control\"><option data-custom-label=\"Yes\" value=\"Yes\">Yes</option><option data-custom-label=\"No\" value=\"No\">No</option></select><button class=\"hidden-sub\">Setup</button></answer-component></div></div>",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#i6l8{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#iovw{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#ixpt{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#i2h2{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i0kj{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#iydq{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i82wp{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ih93l{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#igidj{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#iwq8k{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#iw2gt{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#ivhv9{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#ip76e{margin-right:10px;}#ikt75{margin-right:5px;}#i1f5k{margin-right:10px;}#ibelq{margin-right:5px;}#iletg{margin-right:10px;}#i28tf{margin-right:5px;}#ir258{margin-right:10px;}#ikigp{margin-right:5px;}#ihe9s{margin-right:10px;}#ia3tn{margin-right:10px;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "footerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i8vp\" data-cell-of=\"Footer\" class=\"cell\"><field-from-signature-component id=\"ir7ua\" data-id-signature-linked=\"iuc2k\" data-label-field-of-signature=\"Name\">[Name] from signature<button class=\"hidden-sub\">Setup</button></field-from-signature-component></div><div id=\"i2s7\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"i2xrf\" data-signature-signatureid=\"5ec2d2d1-8647-4fd6-88c6-dbcdb80ed729\" data-signature-label=\"Contractor\" data-signature-number=\"3\">[Signature] Contractor <button class=\"hidden-sub\">Setup</button></signatures-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i6wg\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"iuc2k\" data-signature-signatureid=\"7c7e4a49-b4a5-42bb-917b-9b64fc38862e\" data-signature-label=\"Vendor\" data-signature-number=\"1\">[Signature] Vendor <button class=\"hidden-sub\">Setup</button></signatures-component></div><div id=\"i5tz\" data-cell-of=\"Footer\" class=\"cell\"><field-from-signature-component id=\"iuhpx\" data-id-signature-linked=\"i2xrf\" data-label-field-of-signature=\"Company\">[Company] from signature<button class=\"hidden-sub\">Setup</button></field-from-signature-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i2ua\" data-cell-of=\"Footer\" class=\"cell\"><field-from-signature-component id=\"isnlo\" data-id-signature-linked=\"iuc2k\" data-label-field-of-signature=\"Company\">[Company] from signature<button class=\"hidden-sub\">Setup</button></field-from-signature-component></div><div id=\"iu2o\" data-cell-of=\"Footer\" class=\"cell\"><field-from-signature-component id=\"il72o\" data-id-signature-linked=\"i2xrf\" data-label-field-of-signature=\"Company\">[Company] from signature<button class=\"hidden-sub\">Setup</button></field-from-signature-component></div></div>",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#i8vp{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i2s7{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i6wg{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i5tz{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i2ua{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iu2o{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}@media (max-width: 768px){.row{flex-wrap:wrap;}}"
    },
    "fieldData": {
      "itrNo": "MIA-17",
      "itrDescription": "ABC BAC",
      "itrType": "A",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQM-1002",
      "equipmentDescription": "EQM-1002",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "PIT-112",
      "tagDescription": "PIT-112",
      "tagId": "22343358-5796-4292-aeda-5a9495c22006",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [
      {
        "id": "808ddf39-f06c-49c7-afc3-0f374e4dbe89",
        "question": {
          "customId": "ivhv9",
          "value": "Question 4"
        },
        "answer": [
          {
            "customId": "ipl4g",
            "type": "DROPDOWN",
            "values": [
              "Yes",
              "No"
            ]
          }
        ],
        "currentAnswer": "Yes"
      },
      {
        "id": "76ef407c-4d42-4773-b7c6-64a5b5992a51",
        "question": {
          "customId": "iwq8k",
          "value": "Question 2"
        },
        "answer": [
          {
            "customId": "isyon",
            "type": "RADIO",
            "values": [
              "Yes\n            ",
              "No\n            "
            ]
          }
        ],
        "currentAnswer": "No"
      },
      {
        "id": "88f28c0d-e010-4384-ad8d-9812e80f6e4a",
        "question": {
          "customId": "igidj",
          "value": "Question 1"
        },
        "answer": [
          {
            "customId": "iz8cj",
            "type": "RADIO",
            "values": [
              "Yes\n            ",
              "No\n            "
            ]
          }
        ],
        "currentAnswer": "Yes"
      },
      {
        "id": "5c231164-b630-4512-8285-bf12c5de1acc",
        "question": {
          "customId": "iw2gt",
          "value": "Question 3"
        },
        "answer": [
          {
            "customId": "itj3t",
            "type": "CHECKBOX",
            "values": [
              "Yes\n            "
            ]
          }
        ],
        "currentAnswer": "Yes"
      }
    ],
    "signatures": [
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 1,
        "userName": "Son nguyen real",
        "userCompany": "Testing",
        "signDate": "2020-10-28T18:15:05.25",
        "label": "Vendor"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 2,
        "userName": " ",
        "userCompany": null,
        "signDate": null,
        "label": "Contractor"
      }
    ],
    "status": "Inprogress",
    "canAction": true
  },
  "bf05ff29-5107-4c0b-aa30-f3f02db6b744": {
    "form": {
      "headerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i3hu\" data-cell-of=\"Header\" class=\"cell\"><span id=\"imi5\">Here for test</span></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;min-height:60px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#i3hu{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#imi5{padding:5px;display:inline-block;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i841\" data-cell-of=\"Body\" class=\"cell\"><span id=\"ir3k\">Here for test too</span></div></div>",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;min-height:60px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#i841{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ir3k{padding:5px;display:inline-block;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "footerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"iaw7\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"i4sm\" data-signature-signatureid=\"5ec2d2d1-8647-4fd6-88c6-dbcdb80ed729\" data-signature-label=\"Contractor\" data-signature-number=\"3\">[Signature] Contractor <button class=\"hidden-sub\">Setup</button></signatures-component></div><div id=\"iyyh\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"il6g\" data-signature-signatureid=\"9935492a-c634-40e3-84bd-9a77ae454515\" data-signature-label=\"Sub-Contractor\" data-signature-number=\"2\">[Signature] Sub-Contractor <button class=\"hidden-sub\">Setup</button></signatures-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"iss26\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"iv6dh\" data-signature-signatureid=\"7c7e4a49-b4a5-42bb-917b-9b64fc38862e\" data-signature-label=\"Vendor\" data-signature-number=\"1\">[Signature] Vendor <button class=\"hidden-sub\">Setup</button></signatures-component></div><div id=\"icwbd\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"ioxcz\" data-signature-signatureid=\"cb38f121-1ee6-4182-8a01-2389a20acdd7\" data-signature-label=\"Client\" data-signature-number=\"4\">[Signature] Client <button class=\"hidden-sub\">Setup</button></signatures-component></div></div>",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;min-height:60px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#iaw7{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iyyh{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iss26{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#icwbd{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}@media (max-width: 768px){.row{flex-wrap:wrap;}}"
    },
    "fieldData": {
      "itrNo": "Itr-test-full",
      "itrDescription": "Alignment Check",
      "itrType": "A",
      "disciplineCode": null,
      "disciplineDescription": null,
      "equipmentCode": "EQMT2",
      "equipmentDescription": "NO DELETE",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "TagNo-0101",
      "tagDescription": "Tag No Test 0001234",
      "tagId": "ad5dcfb1-5ec6-4579-96cf-0c576c8f520a",
      "tagType": "",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [],
    "signatures": [
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 1,
        "userName": " ",
        "userCompany": null,
        "signDate": null,
        "label": "Vendor"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 3,
        "userName": " ",
        "userCompany": null,
        "signDate": null,
        "label": "Contractor"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 2,
        "userName": " ",
        "userCompany": null,
        "signDate": null,
        "label": "Sub-Contractor"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 4,
        "userName": " ",
        "userCompany": null,
        "signDate": null,
        "label": "Client"
      }
    ],
    "status": "Rejected",
    "canAction": true
  },
  "2977dd31-c803-4826-8c70-b1756a7aa2b9": {
    "form": {
      "headerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i3hu\" data-cell-of=\"Header\" class=\"cell\"><span id=\"imi5\">Here for test</span></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;min-height:60px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#i3hu{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#imi5{padding:5px;display:inline-block;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i841\" data-cell-of=\"Body\" class=\"cell\"><span id=\"ir3k\">Here for test too</span></div></div>",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;min-height:60px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#i841{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ir3k{padding:5px;display:inline-block;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "footerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"iaw7\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"i4sm\" data-signature-signatureid=\"5ec2d2d1-8647-4fd6-88c6-dbcdb80ed729\" data-signature-label=\"Contractor\" data-signature-number=\"3\">[Signature] Contractor <button class=\"hidden-sub\">Setup</button></signatures-component></div><div id=\"iyyh\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"il6g\" data-signature-signatureid=\"9935492a-c634-40e3-84bd-9a77ae454515\" data-signature-label=\"Sub-Contractor\" data-signature-number=\"2\">[Signature] Sub-Contractor <button class=\"hidden-sub\">Setup</button></signatures-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"iss26\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"iv6dh\" data-signature-signatureid=\"7c7e4a49-b4a5-42bb-917b-9b64fc38862e\" data-signature-label=\"Vendor\" data-signature-number=\"1\">[Signature] Vendor <button class=\"hidden-sub\">Setup</button></signatures-component></div><div id=\"icwbd\" data-cell-of=\"Footer\" class=\"cell\"><signatures-component id=\"ioxcz\" data-signature-signatureid=\"cb38f121-1ee6-4182-8a01-2389a20acdd7\" data-signature-label=\"Client\" data-signature-number=\"4\">[Signature] Client <button class=\"hidden-sub\">Setup</button></signatures-component></div></div>",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;min-height:60px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#iaw7{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iyyh{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iss26{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#icwbd{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}@media (max-width: 768px){.row{flex-wrap:wrap;}}"
    },
    "fieldData": {
      "itrNo": "Itr-test-full",
      "itrDescription": "Alignment Check",
      "itrType": "A",
      "disciplineCode": null,
      "disciplineDescription": null,
      "equipmentCode": "EQMT2",
      "equipmentDescription": "NO DELETE",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "PumpPipe2",
      "systemDescription": "Pump pipe 2.0",
      "tagNo": "TagNo-0101",
      "tagDescription": "Tag No Test 0001234",
      "tagId": "ad5dcfb1-5ec6-4579-96cf-0c576c8f520a",
      "tagType": "",
      "parent": null,
      "workPackNo": "WP1",
      "workPackDescription": "WP2"
    },
    "questions": [],
    "signatures": [
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 3,
        "userName": "Son nguyen real",
        "userCompany": "Testing",
        "signDate": "2020-10-30T10:10:59.867",
        "label": "Contractor"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 4,
        "userName": "Son nguyen real",
        "userCompany": "Testing",
        "signDate": "2020-10-30T10:11:35.607",
        "label": "Client"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 2,
        "userName": "Son nguyen real",
        "userCompany": "Testing",
        "signDate": "2020-10-30T10:09:54.03",
        "label": "Sub-Contractor"
      },
      {
        "id": null,
        "signatureId": "00000000-0000-0000-0000-000000000000",
        "number": 1,
        "userName": "Son nguyen real",
        "userCompany": "Testing",
        "signDate": "2020-10-30T10:09:38.03",
        "label": "Vendor"
      }
    ],
    "status": "Completed",
    "canAction": false
  },
  "79e30c9d-c944-4f0c-bc7a-23631483aa5f": {
    "form": {
      "headerHtml": "<div class=\"row\"><div id=\"iyp9\" class=\"cell\"><span data-custom-type=\"question\" id=\"ilc3u\" data-answer-linked=\"ivusp\">Chán chua</span></div><div id=\"iq9n\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"ivusp\" data-answer-type=\"Checkbox\" data-question-linked=\"ilc3u\" data-hidden-label=\"false\"><label data-custom-label=\"yes\" id=\"i9zzu\"><input type=\"checkbox\" data-checkbox-answer=\"ivusp\" name=\"ivusp\" value=\"yes\" id=\"i6fa9\"/>yes</label><label data-custom-label=\"no\" id=\"iug7n\"><input type=\"checkbox\" data-checkbox-answer=\"ivusp\" name=\"ivusp\" value=\"no\" id=\"izebf\"/>no</label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div class=\"row\"><div id=\"ixml\" class=\"cell\"><span data-custom-type=\"question\" id=\"i3q8y\">Mu?n choi d?u móc?</span></div><div id=\"i4ht\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"i02lj\" data-answer-type=\"Input cell\" data-question-linked=\"izxgg\" data-hidden-label=\"false\"><input type=\"text\" name=\"i02lj\" placeholder=\"Th? 2\"/><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div class=\"row\"><div id=\"i6i5\" class=\"cell\"><span data-custom-type=\"question\" id=\"izxgg\" data-answer-linked=\"i02lj\">Hôm nay là th? m?y</span></div><div id=\"ik3h\" class=\"cell\"><answer-component data-custom-type=\"answer\">Answer <button class=\"hidden-sub\">Setup</button></answer-component></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}span{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#iyp9{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#iq9n{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#ixml{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#i4ht{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i6i5{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#ik3h{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#ilc3u{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#i3q8y{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#izxgg{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#i9zzu{margin-right:10px;}#i6fa9{margin-right:10px;}#iug7n{margin-right:10px;}#izebf{margin-right:10px;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}span{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}",
      "footerHtml": "",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}span{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}"
    },
    "fieldData": {
      "itrNo": "MIA-16",
      "itrDescription": "Alignment Check",
      "itrType": "C",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQ003",
      "equipmentDescription": "des3fdgffd",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "SYS-1013",
      "systemDescription": "SYSTEM 13",
      "tagNo": "TagNo-0105",
      "tagDescription": "Tag No Test 0001",
      "tagId": "b334d0f2-b782-4fd6-b690-9bd0d1e59e73",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP3",
      "workPackDescription": "WorkPack3"
    },
    "questions": [],
    "signatures": null,
    "status": "NotStarted",
    "canAction": true
  },
  "be56dfc7-3c01-40fb-80da-583e2e601c4f": {
    "form": {
      "headerHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"isir\" data-cell-of=\"Header\" class=\"cell\"><span data-custom-type=\"question\" id=\"iv9o\" data-answer-linked=\"igdp\">Do you want more?</span></div><div id=\"ibw4\" data-cell-of=\"Header\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"igdp\" data-answer-type=\"Checkbox\" data-question-linked=\"iv9o\" data-hidden-label=\"false\"><label data-custom-label=\"Yes\" id=\"ixjh\"><input type=\"checkbox\" data-checkbox-answer=\"igdp\" name=\"igdp\" value=\"Yes\" id=\"it0h1\"/>Yes\n            </label><label data-custom-label=\"No\" id=\"ipt1a\"><input type=\"checkbox\" data-checkbox-answer=\"igdp\" name=\"igdp\" value=\"No\" id=\"ibtat\"/>No\n            </label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"ibpt\" data-cell-of=\"Header\" class=\"cell\"></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"ijhzl\" data-cell-of=\"Header\" class=\"cell\"><span data-custom-type=\"question\" id=\"i8lji\" data-answer-linked=\"ib8rm\">OMG!!!</span></div><div id=\"ielsi\" data-cell-of=\"Header\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"ib8rm\" data-answer-type=\"Radio\" data-question-linked=\"i8lji\" data-hidden-label=\"false\"> <label data-custom-label=\"What is problem?\" id=\"iosal\"><input type=\"radio\" name=\"ib8rm\" value=\"What is problem?\" id=\"ibpqs\"/>What is problem?\n            </label> <label data-custom-label=\"na, it is not my work\" id=\"i3a6p\"><input type=\"radio\" name=\"ib8rm\" value=\"na, it is not my work\" id=\"ihbd8\"/>na, it is not my work\n            </label><button class=\"hidden-sub\">Setup</button></answer-component></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i25vt\" data-cell-of=\"Header\" class=\"cell\"></div><div id=\"itk6u\" data-cell-of=\"Header\" class=\"cell\"></div></div>",
      "headerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#isir{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ibw4{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#ibpt{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#iv9o{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#ixjh{margin-right:10px;}#it0h1{margin-right:10px;}#ipt1a{margin-right:10px;}#ibtat{margin-right:10px;}#ijhzl{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ielsi{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i8lji{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}#iosal{margin-right:10px;}#ibpqs{margin-right:5px;}#i3a6p{margin-right:10px;}#ihbd8{margin-right:5px;}#i25vt{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}#itk6u{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "bodyHtml": "<div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"im1o\" data-cell-of=\"Body\" class=\"cell\"><span id=\"i8xx\">Body part</span></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i8p9\" data-cell-of=\"Body\" class=\"cell\"><span data-custom-type=\"question\" id=\"izg3\" data-answer-linked=\"ihx7f\">Where are you come from?</span></div><div id=\"i4sg\" data-cell-of=\"Body\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"ihx7f\" data-answer-type=\"Dropdown\" data-question-linked=\"izg3\" data-hidden-label=\"false\"><select name=\"ihx7f&quot;\" class=\"form-control\"><option data-custom-label=\"Viet nam\" value=\"Viet nam\">Viet nam</option><option data-custom-label=\"Japan\" value=\"Japan\">Japan</option><option data-custom-label=\"Italy\" value=\"Italy\">Italy</option></select><button class=\"hidden-sub\">Setup</button></answer-component></div></div>",
      "bodyCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#im1o{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#i8p9{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#i4sg{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#i8xx{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;display:inline-block;}#izg3{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}@media (max-width: 768px){.row{flex-wrap:wrap;}}",
      "footerHtml": "<div data-custom-type=\"outer-most-row\" id=\"i78m\" class=\"row\"><div id=\"iwgu\" data-cell-of=\"Footer\" class=\"cell\"><img src=\"https://elementstorage.blob.core.windows.net/itr/637342097949761748_ItrUpload.png\" id=\"iyti\"/></div><div id=\"iq3d\" data-cell-of=\"Footer\" class=\"cell\"><span id=\"ifvu\">Satan</span></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"isro\" data-cell-of=\"Footer\" class=\"cell\"><free-text-from-database id=\"ioti4\" data-table-id=\"4\" data-field-id-from-table=\"11\" data-table-name=\"equipment\" data-field-name-from-table=\"Description\" data-custom-type=\"field-from-data-base-component\">[Description] from [Equipment] <button class=\"hidden-sub\">Choose field</button></free-text-from-database></div><div id=\"idig\" data-cell-of=\"Footer\" class=\"cell\"><free-text-from-database id=\"ipu7l\" data-table-id=\"6\" data-field-id-from-table=\"20\" data-table-name=\"itr\" data-field-name-from-table=\"Description\" data-custom-type=\"field-from-data-base-component\">[Description] from [Itr] <button class=\"hidden-sub\">Choose field</button></free-text-from-database></div></div><div data-custom-type=\"outer-most-row\" class=\"row\"><div id=\"i8zpj\" data-cell-of=\"Footer\" class=\"cell\"><span data-custom-type=\"question\" id=\"iv4rl\" data-answer-linked=\"i14cl\">what your name?</span></div><div id=\"ixfjl\" data-cell-of=\"Footer\" class=\"cell\"><answer-component data-custom-type=\"answer\" id=\"i14cl\" data-answer-type=\"Input cell\" data-question-linked=\"iv4rl\" data-hidden-label=\"false\"><input type=\"text\" data-id=\"input-itr-editor\" disabled=\"\" name=\"i14cl\" placeholder=\"Input your answer\" class=\"form-control\"/><button class=\"hidden-sub\">Setup</button></answer-component></div></div>",
      "footerCss": "* { box-sizing: border-box; } body {margin: 0;}input[type=\"checkbox\"]{height:20px;width:20px;vertical-align:sub;}*{box-sizing:border-box;}body{margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;}.row{display:flex;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;outline-color:rgb(48, 113, 184) !important;}.cell{min-height:40px;flex-grow:1;flex-basis:100%;position:relative;outline-color:rgb(48, 113, 184) !important;}#iwgu{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;justify-content:center;}#iq3d{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#iyti{width:150px;}#i78m{height:278px;}#ifvu{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;display:inline-block;}#isro{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#idig{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ioti4{margin-left:5px;}#ipu7l{margin-left:5px;}#i8zpj{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;align-items:center;}#ixfjl{border-top-width:1px;border-top-style:solid;border-top-color:black;border-left-width:1px;border-left-style:solid;border-left-color:black;border-right-width:1px;border-right-style:solid;border-right-color:black;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:black;display:flex;justify-content:center;align-items:center;}#iv4rl{padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:5px;}@media (max-width: 768px){.row{flex-wrap:wrap;}}"
    },
    "fieldData": {
      "itrNo": "I01A",
      "itrDescription": "Instrument Installation",
      "itrType": "Handover",
      "disciplineCode": "D2",
      "disciplineDescription": "Des2",
      "equipmentCode": "EQ003",
      "equipmentDescription": "des3fdgffd",
      "locationCode": null,
      "locationName": null,
      "subSystemNo": null,
      "subSystemDescription": null,
      "systemNo": "SYS-1013",
      "systemDescription": "SYSTEM 13",
      "tagNo": "TagNo-0105",
      "tagDescription": "Tag No Test 0001",
      "tagId": "b334d0f2-b782-4fd6-b690-9bd0d1e59e73",
      "tagType": "Hard",
      "parent": null,
      "workPackNo": "WP3",
      "workPackDescription": "WorkPack3"
    },
    "questions": [
      {
        "id": "ae4134e0-e1fc-48f3-becd-02b06614a790",
        "question": {
          "customId": "iv9o",
          "value": "Do you want more?"
        },
        "answer": [
          {
            "customId": "igdp",
            "type": "CHECKBOX",
            "values": [
              "Yes\n            ",
              "No\n            "
            ]
          }
        ],
        "currentAnswer": null
      },
      {
        "id": "02918f30-e93a-414b-90c8-8e819e9a3798",
        "question": {
          "customId": "izg3",
          "value": "Where are you come from?"
        },
        "answer": [
          {
            "customId": "ihx7f",
            "type": "DROPDOWN",
            "values": [
              "Viet nam",
              "Japan",
              "Italy"
            ]
          }
        ],
        "currentAnswer": null
      },
      {
        "id": "5aeaaa5b-65e6-4628-9fc8-e287b7d60587",
        "question": {
          "customId": "iv4rl",
          "value": "what your name?"
        },
        "answer": [
          {
            "customId": "i14cl",
            "type": "INPUTCELL",
            "values": [
              "Input your answer"
            ]
          }
        ],
        "currentAnswer": null
      },
      {
        "id": "e91cd28b-3077-495d-901a-ea7384e2af46",
        "question": {
          "customId": "i8lji",
          "value": "OMG!!!"
        },
        "answer": [
          {
            "customId": "ib8rm",
            "type": "RADIO",
            "values": [
              "What is problem?\n            ",
              "na, it is not my work\n            "
            ]
          }
        ],
        "currentAnswer": null
      }
    ],
    "signatures": null,
    "status": "NotStarted",
    "canAction": true
  }
}

export class MockTabListApi {
  public getTagTypeData = (): Observable<ApiListResponse> => {
    let response = <ApiListResponse>{
      status: 1,
      message: '',
      items: [...tagList]
    };
    return Observable.create(observer => {
      observer.next(response);
      observer.complete();
    });
  }
}

// {
//   "locked": false,
//   "lockedByUserID": null,
//   "lockedDate": null,
//   "tagId": "b24969b1-3bac-414b-92f5-f0ed8ae26056",
//   "tagNo": "TagNo-0106",
//   "tagName": "Tag No Test 0001",
//   "equipmentType": "EQ003",
//   "tagType": "Hard",
//   "system": "SYS-1013",
//   "subSystem": null,
//   "workPackNo": "WP3",
//   "parent": null,
//   "locationCode": null,
//   "discipline": "D2",
//   "project": "GAS1111",
//   "status": false,
//   "locationId": null,
//   "workPackId": "00f5fc3f-4a67-4197-b00f-7f761ae44252",
//   "equipmentTypeId": "8487912b-0978-4520-b496-0c19c241b905",
//   "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
//   "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "subSystemId": null,
//   "parentId": null,
//   "referenceId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "referenceTypeId": 1,
//   "jobCardLookUpValueModels": [
//     {
//       "workPackNo": "WP3",
//       "id": "809b6c04-d305-4323-8b36-1fe2cfa9656c",
//       "value": "jc1"
//     }
//   ],
//   "tagSideMenu": {
//     "itrs":[
//       {
//         "tagItrId": "32508bbc-a8b1-44fe-a3da-022ad61b27ab",
//         "tagNo": "TagNo-0106",
//         "itrNo": "I01A",
//         "itrId": "2f0217c4-e897-42f2-a925-0e8af3503b74",
//         "tagId": "b24969b1-3bac-414b-92f5-f0ed8ae26056",
//         "status": "NotStarted",
//         "itrDescription": "Instrument Installation",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//       {
//         "tagItrId": "831f1b64-1525-4df4-bcf9-4f42b71e8261",
//         "tagNo": "TagNo-0106",
//         "itrNo": "MIA-16",
//         "itrId": "0c293ac3-200b-4ec7-9e94-05f5e3ed9466",
//         "tagId": "b24969b1-3bac-414b-92f5-f0ed8ae26056",
//         "status": "NotStarted",
//         "itrDescription": "Alignment Check",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//       {
//         "tagItrId": "38809ac4-13de-4a47-b18c-95e7e42dac9e",
//         "tagNo": "TagNo-0106",
//         "itrNo": "Itr-test-full",
//         "itrId": "3d5e5ad2-0657-417c-b53d-60a2389d1d4d",
//         "tagId": "b24969b1-3bac-414b-92f5-f0ed8ae26056",
//         "status": "Waiting",
//         "itrDescription": "Alignment Check",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//     ],
//   }
// },
// {
//   "locked": false,
//   "lockedByUserID": null,
//   "lockedDate": null,
//   "tagId": "9ca6d85a-dea0-4af8-ad06-fa3ef2b03fbb",
//   "tagNo": "TagNo-0107",
//   "tagName": "Tag No Test 0001",
//   "equipmentType": "EQ003",
//   "tagType": "Hard",
//   "system": "SYS-1013",
//   "subSystem": null,
//   "workPackNo": "WP3",
//   "parent": null,
//   "locationCode": null,
//   "discipline": "D2",
//   "project": "GAS1111",
//   "status": true,
//   "locationId": null,
//   "workPackId": "00f5fc3f-4a67-4197-b00f-7f761ae44252",
//   "equipmentTypeId": "8487912b-0978-4520-b496-0c19c241b905",
//   "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
//   "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "subSystemId": null,
//   "parentId": null,
//   "referenceId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "referenceTypeId": 1,
//   "jobCardLookUpValueModels": [
//     {
//       "workPackNo": "WP3",
//       "id": "809b6c04-d305-4323-8b36-1fe2cfa9656c",
//       "value": "jc1"
//     }
//   ],
//   "tagSideMenu": {
//     "itrs":[
//       {
//         "tagItrId": "bca76976-5cf3-47d9-b395-46455073d668",
//         "tagNo": "TagNo-0107",
//         "itrNo": "MIA-16",
//         "itrId": "0c293ac3-200b-4ec7-9e94-05f5e3ed9466",
//         "tagId": "9ca6d85a-dea0-4af8-ad06-fa3ef2b03fbb",
//         "status": "NotStarted",
//         "itrDescription": "Alignment Check",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//       {
//         "tagItrId": "54a48ea9-84a1-4d05-a251-c42483d5e425",
//         "tagNo": "TagNo-0107",
//         "itrNo": "I01A",
//         "itrId": "2f0217c4-e897-42f2-a925-0e8af3503b74",
//         "tagId": "9ca6d85a-dea0-4af8-ad06-fa3ef2b03fbb",
//         "status": "NotStarted",
//         "itrDescription": "Instrument Installation",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//     ],
//   }
// },
// {
//   "locked": false,
//   "lockedByUserID": null,
//   "lockedDate": null,
//   "tagId": "db6be7aa-5087-4c21-aa37-f87d764e1527",
//   "tagNo": "TagNo-0108",
//   "tagName": "Tag No Test 0001",
//   "equipmentType": "EQ003",
//   "tagType": "Hard",
//   "system": "SYS-1013",
//   "subSystem": null,
//   "workPackNo": "WP3",
//   "parent": null,
//   "locationCode": null,
//   "discipline": "D2",
//   "project": "GAS1111",
//   "status": false,
//   "locationId": null,
//   "workPackId": "00f5fc3f-4a67-4197-b00f-7f761ae44252",
//   "equipmentTypeId": "8487912b-0978-4520-b496-0c19c241b905",
//   "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
//   "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "subSystemId": null,
//   "parentId": null,
//   "referenceId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "referenceTypeId": 1,
//   "jobCardLookUpValueModels": [
//     {
//       "workPackNo": "WP3",
//       "id": "809b6c04-d305-4323-8b36-1fe2cfa9656c",
//       "value": "jc1"
//     }
//   ],
//   "tagSideMenu": {
//     "itrs":[
//       {
//         "tagItrId": "81bb24e6-c871-4629-aea1-011a1e2cf3d5",
//         "tagNo": "TagNo-0108",
//         "itrNo": "MIA-16",
//         "itrId": "0c293ac3-200b-4ec7-9e94-05f5e3ed9466",
//         "tagId": "db6be7aa-5087-4c21-aa37-f87d764e1527",
//         "status": "NotStarted",
//         "itrDescription": "Alignment Check",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//       {
//         "tagItrId": "c752c428-691f-4f0a-913f-45f03b1cd005",
//         "tagNo": "TagNo-0108",
//         "itrNo": "I01A",
//         "itrId": "2f0217c4-e897-42f2-a925-0e8af3503b74",
//         "tagId": "db6be7aa-5087-4c21-aa37-f87d764e1527",
//         "status": "NotStarted",
//         "itrDescription": "Instrument Installation",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//     ],
//   }
// },
// {
//   "locked": false,
//   "lockedByUserID": null,
//   "lockedDate": null,
//   "tagId": "377859a6-39bf-43cd-970e-ca6d482fd9bb",
//   "tagNo": "TagNo-0109",
//   "tagName": "Tag No Test 0001",
//   "equipmentType": "EQ003",
//   "tagType": "Hard",
//   "system": "SYS-1013",
//   "subSystem": null,
//   "workPackNo": "WP3",
//   "parent": null,
//   "locationCode": null,
//   "discipline": "D2",
//   "project": "GAS1111",
//   "status": true,
//   "locationId": null,
//   "workPackId": "00f5fc3f-4a67-4197-b00f-7f761ae44252",
//   "equipmentTypeId": "8487912b-0978-4520-b496-0c19c241b905",
//   "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
//   "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "subSystemId": null,
//   "parentId": null,
//   "referenceId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "referenceTypeId": 1,
//   "jobCardLookUpValueModels": [
//     {
//       "workPackNo": "WP3",
//       "id": "809b6c04-d305-4323-8b36-1fe2cfa9656c",
//       "value": "jc1"
//     }
//   ],
//   "tagSideMenu": {
//     "itrs":[
//       {
//         "tagItrId": "fb15a8eb-62de-40e6-a683-1ec61cbc8b29",
//         "tagNo": "TagNo-0109",
//         "itrNo": "I01A",
//         "itrId": "2f0217c4-e897-42f2-a925-0e8af3503b74",
//         "tagId": "377859a6-39bf-43cd-970e-ca6d482fd9bb",
//         "status": "NotStarted",
//         "itrDescription": "Instrument Installation",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//       {
//         "tagItrId": "1f197376-2414-4354-a89f-a381fd23f8f2",
//         "tagNo": "TagNo-0109",
//         "itrNo": "MIA-16",
//         "itrId": "0c293ac3-200b-4ec7-9e94-05f5e3ed9466",
//         "tagId": "377859a6-39bf-43cd-970e-ca6d482fd9bb",
//         "status": "NotStarted",
//         "itrDescription": "Alignment Check",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//     ],
//   }
// },
// {
//   "locked": false,
//   "lockedByUserID": null,
//   "lockedDate": null,
//   "tagId": "aeeac60c-ebcf-4ad6-b708-7fdba559ce96",
//   "tagNo": "TagNo-0110",
//   "tagName": "Tag No Test 0001",
//   "equipmentType": "EQ003",
//   "tagType": "Hard",
//   "system": "SYS-1013",
//   "subSystem": null,
//   "workPackNo": "WP3",
//   "parent": null,
//   "locationCode": null,
//   "discipline": "D2",
//   "project": "GAS1111",
//   "status": false,
//   "locationId": null,
//   "workPackId": "00f5fc3f-4a67-4197-b00f-7f761ae44252",
//   "equipmentTypeId": "8487912b-0978-4520-b496-0c19c241b905",
//   "disciplineId": "274700c1-0e90-485b-a66d-a959e0e8cf13",
//   "systemId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "subSystemId": null,
//   "parentId": null,
//   "referenceId": "3e5cd197-24b0-4f9d-a1bd-da20873b654b",
//   "referenceTypeId": 1,
//   "jobCardLookUpValueModels": [
//     {
//       "workPackNo": "WP3",
//       "id": "809b6c04-d305-4323-8b36-1fe2cfa9656c",
//       "value": "jc1"
//     }
//   ],
//   "tagSideMenu": {
//     "itrs":[
//       {
//         "tagItrId": "68ca92dc-f2a8-4777-8713-b14a5ee34cc6",
//         "tagNo": "TagNo-0110",
//         "itrNo": "Itr-test-full",
//         "itrId": "3d5e5ad2-0657-417c-b53d-60a2389d1d4d",
//         "tagId": "aeeac60c-ebcf-4ad6-b708-7fdba559ce96",
//         "status": "Completed",
//         "itrDescription": "Alignment Check",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//       {
//         "tagItrId": "3edf390b-31c0-4640-bf5d-c439752d3a83",
//         "tagNo": "TagNo-0110",
//         "itrNo": "Itr-test-full",
//         "itrId": "3d5e5ad2-0657-417c-b53d-60a2389d1d4d",
//         "tagId": "aeeac60c-ebcf-4ad6-b708-7fdba559ce96",
//         "status": "Waiting",
//         "itrDescription": "Alignment Check",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       }
//     ],
//   }
// },
// {
//   "locked": false,
//   "lockedByUserID": null,
//   "lockedDate": null,
//   "tagId": "df03801d-d52b-4430-93bd-758fdb73097e",
//   "tagNo": "TEST-0724-10015",
//   "tagName": "TEST-0626-10012",
//   "equipmentType": "EQM-1005",
//   "tagType": "",
//   "system": null,
//   "subSystem": null,
//   "workPackNo": null,
//   "parent": null,
//   "locationCode": null,
//   "discipline": null,
//   "project": "GAS1111",
//   "status": true,
//   "locationId": null,
//   "workPackId": null,
//   "equipmentTypeId": "782856cb-7ecc-4b4b-bf4f-fbda9a5cfef6",
//   "disciplineId": null,
//   "systemId": null,
//   "subSystemId": null,
//   "parentId": null,
//   "referenceId": null,
//   "referenceTypeId": null,
//   "jobCardLookUpValueModels": null,
//   "tagSideMenu": {
//     "itrs":[
//       {
//         "tagItrId": "d1fed25d-a995-44d3-a2d1-30a00bca4c0e",
//         "tagNo": "TEST-0724-10015",
//         "itrNo": "MIIA",
//         "itrId": "5b9c54de-7f44-403c-8c0e-803e5714571d",
//         "tagId": "df03801d-d52b-4430-93bd-758fdb73097e",
//         "status": "Waiting",
//         "itrDescription": "NUOCMIA",
//         "rejectReason": null,
//         "isAdded": null,
//         "isDeleted": null
//       },
//     ],
//   }
// }