import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentDocState,
  docsState,
  messagesState,
  sharedDocsState,
  sharedWithUsers,
} from "../atom";
import { useCallback, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const useGetUserDocs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDocsState = useSetRecoilState(docsState);

  const getUserDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await axios.get(`${API_URL}/api/docs/`, {
        withCredentials: true,
      });
      setDocsState(docs.data.docs);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [setDocsState]);

  return { getUserDocs, loading, error };
};

const useGetSharedDocs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setDocsState = useSetRecoilState(sharedDocsState);

  const getSharedDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await axios.get(`${API_URL}/api/docs/shared/`, {
        withCredentials: true,
      });
      setDocsState(docs.data.docs);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [setDocsState]);

  return { getSharedDocs, loading, error };
};

const useGetDocMessages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setMessages = useSetRecoilState(messagesState);

  const getDocMessages = useCallback(
    async (docId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_URL}/api/docs/${docId}/chats/`,
          {
            withCredentials: true,
          }
        );
        setMessages(response.data.messages);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [setMessages]
  );

  return { getDocMessages, loading, error };
};

const useCreateDoc = () => {
  const setCurrentDocState = useSetRecoilState(currentDocState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createDoc = async () => {
    try {
      setLoading(true);
      setError(null);
      const doc = await axios.post(
        `${API_URL}/api/docs/`,
        {
          title: "Untitled Document",
          content: "",
        },
        { withCredentials: true }
      );
      setCurrentDocState(doc.data);
      return doc.data;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  return { createDoc, loading, error };
};

const useDeleteDoc = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteDoc = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/docs/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  return { deleteDoc, loading, error };
};

const useGetDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentDoc = useSetRecoilState(currentDocState);

  const getDocument = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/docs/${id}`, {
          withCredentials: true,
        });
        const doc = response.data;

        setCurrentDoc({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          summary: doc.summary,
          ownerId: doc.ownerId,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        });
        console.log(doc);
        return doc;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentDoc]
  );

  return { getDocument, loading, error };
};

const useSaveDocChanges = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentDoc = useRecoilValue(currentDocState);

  const saveDocChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.put(
        `${API_URL}/api/docs/${currentDoc.id}`,
        {
          title: currentDoc.title,
          content: currentDoc.content,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { saveDocChanges, loading, error };
};

const useGetCollaborators = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCollaborators = useSetRecoilState(sharedWithUsers);

  const getCollaborators = useCallback(
    async (docId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_URL}/api/docs/${docId}/shared/`,
          {
            withCredentials: true,
          }
        );
        setCollaborators(response.data.sharedWith);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [setCollaborators]
  );

  return { getCollaborators, loading, error };
};

const useUpdateTitle = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const title = useRecoilValue(currentDocState).title;

  const updateTitle = useCallback(
    async (docId: string) => {
      try {
        setLoading(true);
        setError(null);
        await axios.put(
          `${API_URL}/api/docs/${docId}/title/`,
          {
            title,
          },
          {
            withCredentials: true,
          }
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [title]
  );

  return { updateTitle, loading, error };
};

const useUpdateSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const summary = useRecoilValue(currentDocState).summary;

  const updateSummary = useCallback(
    async (docId: string) => {
      try {
        setLoading(true);
        setError(null);
        await axios.put(
          `${API_URL}/api/docs/${docId}/summary/`,
          {
            summary,
          },
          {
            withCredentials: true,
          }
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [summary]
  );

  return { updateSummary, loading, error };
};

const useAddCollaborator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCollaborator = async (docId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.put(
        `${API_URL}/api/docs/${docId}/${email}/`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { addCollaborator, loading, error };
};

const useRemoveCollaborator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeCollaborator = async (docId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/docs/${docId}/${email}/`, {
        withCredentials: true,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { removeCollaborator, loading, error };
};

export {
  useGetUserDocs,
  useCreateDoc,
  useGetDocument,
  useSaveDocChanges,
  useDeleteDoc,
  useGetCollaborators,
  useAddCollaborator,
  useRemoveCollaborator,
  useGetSharedDocs,
  useUpdateTitle,
  useUpdateSummary,
  useGetDocMessages,
};
