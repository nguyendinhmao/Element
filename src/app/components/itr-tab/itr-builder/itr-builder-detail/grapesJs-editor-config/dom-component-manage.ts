import ITRBuilderCommonModel from "../../../../../shared/models/itr-tab/itr-builder-common-ddb.model";

export default {
  DisabledBadgeAllComponentTypes: (
    domComponentManage: ITRBuilderCommonModel.DomComponentManager
  ) => {
    const ListComponentTypes = domComponentManage.getTypes();
    ListComponentTypes.map((ComponentType) =>
      domComponentManage.addType(ComponentType.id, {
        model: {
          defaults: {
            badgable: false,
          },
        },
      })
    );
  },
};
