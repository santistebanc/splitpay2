import { useQuery } from "@powersync/react";
import { useMemo } from "react";

import type { GroupWithMembers } from "../create-group";
import {
  mapGroupRow,
  mapMemberRow,
  type GroupRow,
  type MemberRow,
} from "../group-query-rows";

/** Watched group row and member roster for one group. */
export function useGroupWithMembers(groupId: string): {
  group: GroupWithMembers | null;
  isLoading: boolean;
} {
  const { data: groupRows = [], isLoading: loadingGroup } = useQuery<GroupRow>(
    `SELECT id, name, join_code, currency, created_at
     FROM groups
     WHERE id = ?`,
    [groupId]
  );
  const { data: memberRows = [], isLoading: loadingMembers } =
    useQuery<MemberRow>(
      `SELECT id, group_id, display_name
       FROM members
       WHERE group_id = ?
       ORDER BY display_name`,
      [groupId]
    );

  const group = useMemo((): GroupWithMembers | null => {
    const row = groupRows[0];
    if (!row) {
      return null;
    }

    return {
      ...mapGroupRow(row),
      members: memberRows.map(mapMemberRow),
    };
  }, [groupRows, memberRows]);

  return {
    group,
    isLoading: loadingGroup || loadingMembers,
  };
}

/** Watched home-screen group list, newest first. */
export function useAllGroups() {
  const { data: rows = [], isLoading } = useQuery<GroupRow>(
    `SELECT id, name, join_code, currency, created_at
     FROM groups
     ORDER BY created_at DESC`
  );

  const groups = useMemo(() => rows.map(mapGroupRow), [rows]);

  return { groups, isLoading };
}
