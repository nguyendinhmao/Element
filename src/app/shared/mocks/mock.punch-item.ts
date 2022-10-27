import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';

export const punchPageItem = [
    {
        category: "A",
        correctiveAction: "abcd",
        description: "abc",
        disciplineCode: "TEST-DSL1",
        disciplineId: "a12c349c-e24e-49c4-a866-e00af176cf9b",
        drawingIds: null,
        drawings: [{
            drawingId: "998c1888-fb2f-49a0-955e-0b0da3ab29fb",
            drawingNo: "TEST-DRN01",
            isAdded: false,
            isDeleted: false,
            isLocationDrawing: true,
        }],
        images: [],
        locationCode: "TEST-LC-01",
        locationId: null,
        materialsRequired: false,
        numberSigned: 0,
        orderId: null,
        orderNo: null,
        punchId: "9ad1c3f6-2c08-40c7-bc12-bd8cda1c6b9b",
        punchNo: "000032",
        punchTypeId: "2763cf0b-1d7e-44b3-95b9-036e97b0efa7",
        raisedBy: null,
        raisedById: null,
        rejectReason: null,
        signatures: [],
        status: "DRAFT",
        statusId: 6,
        subSystemId: "68db88c2-8793-4f10-9f70-5e5302a09337",
        subSystemNo: "TEST-SS06",
        systemId: "805c3b10-e87b-4b85-9a20-ef5cf0638b94",
        systemNo: "TEST-S06",
        tagId: "7bb430f2-0728-4552-aa45-b1e1f0aa3aaa",
        tagNo: "TEST-Tag01",
        totalSignatures: 0,
        type: "TEST-PT06",
    },
    {
        category: "A",
        correctiveAction: "correct check count for subsystem",
        description: "check count for subsystem",
        disciplineCode: "TEST-DSL1",
        disciplineId: "a12c349c-e24e-49c4-a866-e00af176cf9b",
        drawingIds: null,
        drawings: [{
            drawingId: "998c1888-fb2f-49a0-955e-0b0da3ab29fb",
            drawingNo: "TEST-DRN01",
            isAdded: false,
            isDeleted: false,
            isLocationDrawing: true,
        }],
        images: [],
        locationCode: "TEST-LC-04",
        locationId: null,
        materialsRequired: false,
        numberSigned: 0,
        orderId: null,
        orderNo: null,
        punchId: "c933e73c-ab66-4b2f-a5cf-990ca36c3367",
        punchNo: "000029",
        punchTypeId: "2763cf0b-1d7e-44b3-95b9-036e97b0efa7",
        raisedBy: "admin@element.com",
        raisedById: "db4b4539-f556-ea11-a81f-00155d006511",
        rejectReason: null,
        signatures: [],
        status: "SUBMITED",
        statusId: 5,
        subSystemId: "68db88c2-8793-4f10-9f70-5e5302a09337",
        subSystemNo: "TEST-SS06",
        systemId: "805c3b10-e87b-4b85-9a20-ef5cf0638b94",
        systemNo: "TEST-S06",
        tagId: "7bb430f2-0728-4552-aa45-b1e1f0aa3aaa",
        tagNo: "TEST-Tag01",
        totalSignatures: 0,
        type: "TEST-PT06",
    },
    {
        category: "A",
        correctiveAction: "correct",
        description: "desciption test",
        disciplineCode: "TEST-DSL1",
        disciplineId: "a12c349c-e24e-49c4-a866-e00af176cf9b",
        drawingIds: null,
        drawings: [{
            drawingId: "998c1888-fb2f-49a0-955e-0b0da3ab29fb",
            drawingNo: "TEST-DRN01",
            isAdded: false,
            isDeleted: false,
            isLocationDrawing: true,
        }],
        images: [],
        locationCode: "TEST-LC-04",
        locationId: null,
        materialsRequired: false,
        numberSigned: 1,
        orderId: null,
        orderNo: null,
        punchId: "3bff95f7-0433-4bdb-8430-eaf0d61d6405",
        punchNo: "000007",
        punchTypeId: "2763cf0b-1d7e-44b3-95b9-036e97b0efa7",
        raisedBy: "admin@element.com",
        raisedById: "db4b4539-f556-ea11-a81f-00155d006511",
        rejectReason: "",
        signatures: [
            {
                description: "signature of boss",
                isTurn: false,
                number: 1,
                signDate: "2020-11-06T18:29:16.583",
                signedName: "Admin Elements",
            },
            { number: 2, description: "dfsd", signedName: " ", signDate: null, isTurn: true },
            { number: 3, description: "dfdsf", signedName: " ", signDate: null, isTurn: false },],
        status: "APPROVED",
        statusId: 2,
        subSystemId: null,
        subSystemNo: null,
        systemId: "bff6b338-af62-4ed7-93b6-1ab7a7b9f485",
        systemNo: "TEST-S01",
        tagId: "7bb430f2-0728-4552-aa45-b1e1f0aa3aaa",
        tagNo: "TEST-Tag01",
        totalSignatures: 3,
        type: "TEST-PT06",
    },

];

const lookupPunch = {
    system: [
        {
            "projectId": "521d436b-56c2-401a-bbb2-c15a30395c3d",
            "id": "b33de9cf-d88f-483c-b023-3000ef152b2a",
            "value": "PumpPipe2"
        },
        {
            "projectId": "521d436b-56c2-401a-bbb2-c15a30395c3d",
            "id": "1bbfa32d-3a00-4dfe-95da-9a6505a50009",
            "value": "SYS-2023"
        },
        {
            "projectId": "521d436b-56c2-401a-bbb2-c15a30395c3d",
            "id": "07dc4e49-8a24-442b-b0aa-374448a012c5",
            "value": "Water 12"
        }
    ],
    subsystem: [
        {
            "systemId": "cc7ac986-cad8-4278-bd5c-a081f7e4f789",
            "id": "46d83048-b967-48f1-bd56-b312a5cf4d0d",
            "value": "SB-1003"
        },
        {
            "systemId": "cc7ac986-cad8-4278-bd5c-a081f7e4f789",
            "id": "82234c92-c2ad-47d0-89ec-dde1a5d452d7",
            "value": "SB-1004"
        },
        {
            "systemId": "e99b02a2-7683-4222-87c7-9f275933c648",
            "id": "8c96e837-e5ad-48d9-9ba9-3e058d8fe580",
            "value": "SS1"
        },
        {
            "systemId": "e99b02a2-7683-4222-87c7-9f275933c648",
            "id": "63cf3efb-3278-4b6b-9162-e3dc6f8cf2ef",
            "value": "SS2"
        },
        {
            "systemId": "db1534fd-c113-434a-a019-8aff0af5130d",
            "id": "efc12d63-dc21-4cbd-9432-6d3af5108523",
            "value": "SUB-001"
        },
        {
            "systemId": "db1534fd-c113-434a-a019-8aff0af5130d",
            "id": "a0e0188a-1c85-4871-84e1-797c32432eef",
            "value": "SUB-002"
        },
        {
            "systemId": "db1534fd-c113-434a-a019-8aff0af5130d",
            "id": "cf5812c2-14a4-48bf-bbfb-f0a2e2b193d5",
            "value": "SUB-003"
        },
        {
            "systemId": "db1534fd-c113-434a-a019-8aff0af5130d",
            "id": "a3a1059b-e2d3-46e4-a93a-c3a330f40ab0",
            "value": "SUB-004"
        },
        {
            "systemId": "b04c3751-9d4e-4664-ae42-a44b7f046454",
            "id": "681c5b3d-f511-454d-afdb-5284af097683",
            "value": "SUB-005"
        },
        {
            "systemId": "b04c3751-9d4e-4664-ae42-a44b7f046454",
            "id": "7c534d6d-39e3-4fcf-b4c9-43d9118fc634",
            "value": "SUB-006"
        },
        {
            "systemId": "b04c3751-9d4e-4664-ae42-a44b7f046454",
            "id": "e31ce0ed-0f28-40a2-8554-0756a4e2e741",
            "value": "SUB-007"
        },
        {
            "systemId": "b04c3751-9d4e-4664-ae42-a44b7f046454",
            "id": "dbd5c120-2e50-4b55-bc2c-66acad6fa7ab",
            "value": "SUB-008"
        },
        {
            "systemId": "b04c3751-9d4e-4664-ae42-a44b7f046454",
            "id": "ee80533f-e5ee-40a1-949f-bfb8de99f492",
            "value": "SUB-009"
        },
        {
            "systemId": "b04c3751-9d4e-4664-ae42-a44b7f046454",
            "id": "549aa8e3-9833-4f50-9728-81b0adc9fdb3",
            "value": "SUB-010"
        },
        {
            "systemId": "cd4cd903-498d-461a-8de7-0851223ca70d",
            "id": "d9177ea3-d95b-47d7-a364-a743c2f4f20f",
            "value": "SUB-011"
        },
        {
            "systemId": "19463418-38d8-4150-9833-21ed3b5b7891",
            "id": "187d36a8-482e-48a2-aa3b-c660e5927d21",
            "value": "SUB-012"
        },
        {
            "systemId": "86675c4c-d7f7-4c46-ad9b-92144a4f1619",
            "id": "342979a4-11a0-4b9f-81e0-9c0e150e7dba",
            "value": "SUB-013"
        },
        {
            "systemId": "99b48bd0-9b6e-4665-9eec-62bc56a7887a",
            "id": "0fa32130-9bcf-4205-ad95-734262818f0e",
            "value": "SUB-014"
        },
        {
            "systemId": "ebef5a97-806e-4450-a6d0-66a2b079e700",
            "id": "6707bfdd-7e02-4ce8-a1b3-a010c0ed1220",
            "value": "SUB-015"
        },
        {
            "systemId": "eba0348a-70bc-47dc-bc08-bc3e120b173a",
            "id": "052862d1-4ce1-426f-b357-461b6fd29d73",
            "value": "SUB-016"
        },
        {
            "systemId": "d9406027-5be9-4662-ad2f-8870b7d40dd4",
            "id": "f202005f-0621-4f06-b81e-abd11d919f1d",
            "value": "SUB-017"
        },
        {
            "systemId": "9d5d036a-35f6-4edc-94d7-36a6ac3bfdc9",
            "id": "87d3ac38-be8d-4743-97ae-762a8623df1b",
            "value": "SUB-018"
        },
        {
            "systemId": "cc7ac986-cad8-4278-bd5c-a081f7e4f789",
            "id": "93e758d2-ff9f-4fe3-941d-4da0b5ecb7c5",
            "value": "SUB-019"
        },
        {
            "systemId": "1bbfa32d-3a00-4dfe-95da-9a6505a50009",
            "id": "2525586d-c6f4-455a-a93a-c11b1b86301e",
            "value": "Sub-2023"
        },
        {
            "systemId": "1bbfa32d-3a00-4dfe-95da-9a6505a50009",
            "id": "487c304e-0ed5-49bd-b5ec-b042f3c0dadd",
            "value": "Sub-2024"
        }
    ],
    locations: [
        {
            "id": "3a182602-c997-4604-ac8a-0fcb9adda823",
            "value": "LD1"
        },
        {
            "id": "7c845daf-5c3a-4ffc-8a6e-00dfeda146f4",
            "value": "LD30"
        },
        {
            "id": "26a0c97d-6aaf-4530-951a-0069eab1901b",
            "value": "LD82"
        }
    ],
    discipline: [
        {
            "id": "e7d1e56f-5555-45f7-a2cf-d30d5c6a95f0",
            "value": "D1"
        },
        {
            "id": "274700c1-0e90-485b-a66d-a959e0e8cf13",
            "value": "D2"
        }
    ],
}

export class MockPunchItemApi {
    public getPunchItemData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: [...punchPageItem]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}